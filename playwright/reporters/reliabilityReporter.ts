import fs from "node:fs";
import path from "node:path";

import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

type TestRecord = {
  test: TestCase;
  results: TestResult[];
};

type ReliabilitySummary = {
  generatedAt: string;
  status: FullResult["status"];
  durationMs: number;
  ci: {
    provider: string;
    runId?: string;
    runAttempt?: string;
    sha?: string;
    ref?: string;
  };
  totals: {
    total: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
    retried: number;
  };
  slowest: ReliabilityTestSummary[];
  failures: ReliabilityTestSummary[];
  flakyCandidates: ReliabilityTestSummary[];
};

type ReliabilityTestSummary = {
  project: string;
  file: string;
  title: string;
  status: TestResult["status"];
  outcome: ReturnType<TestCase["outcome"]>;
  durationMs: number;
  retries: number;
  error?: string;
};

class ReliabilityReporter implements Reporter {
  private readonly records = new Map<string, TestRecord>();
  private readonly reportName = process.env.RELIABILITY_REPORT_NAME ?? "reliability-summary";
  private startTime = Date.now();
  private outputDir = path.join(process.cwd(), "reports");

  onBegin(_config: FullConfig) {
    this.startTime = Date.now();
    this.outputDir = path.join(process.cwd(), "reports");
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.rmSync(path.join(this.outputDir, `${this.reportName}.json`), { force: true });
    fs.rmSync(path.join(this.outputDir, `${this.reportName}.md`), { force: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const record = this.records.get(test.id) ?? { test, results: [] };
    record.results.push(result);
    this.records.set(test.id, record);
  }

  async onEnd(result: FullResult) {
    const summary = this.buildSummary(result);
    const jsonPath = path.join(this.outputDir, `${this.reportName}.json`);
    const markdownPath = path.join(this.outputDir, `${this.reportName}.md`);
    const markdown = this.buildMarkdown(summary);

    fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
    fs.writeFileSync(markdownPath, markdown);

    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${markdown}\n`);
    }
  }

  private buildSummary(result: FullResult): ReliabilitySummary {
    const tests = [...this.records.values()].map((record) => this.toTestSummary(record));
    const failed = tests.filter((test) => test.outcome === "unexpected");
    const flaky = tests.filter((test) => test.outcome === "flaky");
    const skipped = tests.filter((test) => test.status === "skipped");
    const passed = tests.filter((test) => test.outcome === "expected" && test.status === "passed");
    const retried = tests.filter((test) => test.retries > 0);
    const slowest = [...tests]
      .filter((test) => test.status !== "skipped")
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10);

    return {
      generatedAt: new Date().toISOString(),
      status: result.status,
      durationMs: Date.now() - this.startTime,
      ci: {
        provider: process.env.GITHUB_ACTIONS ? "github-actions" : "local",
        ...(process.env.GITHUB_RUN_ID ? { runId: process.env.GITHUB_RUN_ID } : {}),
        ...(process.env.GITHUB_RUN_ATTEMPT ? { runAttempt: process.env.GITHUB_RUN_ATTEMPT } : {}),
        ...(process.env.GITHUB_SHA ? { sha: process.env.GITHUB_SHA } : {}),
        ...(process.env.GITHUB_REF_NAME ? { ref: process.env.GITHUB_REF_NAME } : {}),
      },
      totals: {
        total: tests.length,
        passed: passed.length,
        failed: failed.length,
        flaky: flaky.length,
        skipped: skipped.length,
        retried: retried.length,
      },
      slowest,
      failures: failed,
      flakyCandidates: flaky.length > 0 ? flaky : retried,
    };
  }

  private toTestSummary(record: TestRecord): ReliabilityTestSummary {
    const finalResult = record.results[record.results.length - 1];
    const project = record.test.parent.project()?.name ?? "unknown";
    const title = record.test
      .titlePath()
      .filter((part) => part && part !== project && !part.endsWith(".spec.ts"))
      .join(" > ");
    const errorMessage = finalResult.errors
      .map((error) => error.message)
      .filter(Boolean)
      .join("\n");

    return {
      project,
      file: path.relative(process.cwd(), record.test.location.file),
      title: title || record.test.title,
      status: finalResult.status,
      outcome: record.test.outcome(),
      durationMs: finalResult.duration,
      retries: Math.max(record.results.length - 1, 0),
      ...(errorMessage ? { error: errorMessage } : {}),
    };
  }

  private buildMarkdown(summary: ReliabilitySummary) {
    const totals = summary.totals;
    const lines = [
      "# Playwright Reliability Summary",
      "",
      `Status: **${summary.status}**`,
      `Duration: **${formatDuration(summary.durationMs)}**`,
      `Source: **${summary.ci.provider}**`,
      "",
      "## Reliability KPIs",
      "",
      "| Total | Passed | Failed | Flaky | Skipped | Retried |",
      "| ---: | ---: | ---: | ---: | ---: | ---: |",
      `| ${totals.total} | ${totals.passed} | ${totals.failed} | ${totals.flaky} | ${totals.skipped} | ${totals.retried} |`,
      "",
      "## Slowest Tests",
      "",
      ...tableFor(summary.slowest),
      "",
      "## Failures",
      "",
      ...(summary.failures.length > 0
        ? tableFor(summary.failures)
        : ["No failing tests in this run."]),
      "",
      "## Flaky Candidates",
      "",
      ...(summary.flakyCandidates.length > 0
        ? tableFor(summary.flakyCandidates)
        : ["No flaky or retried tests in this run."]),
      "",
    ];

    return `${lines.join("\n")}\n`;
  }
}

function tableFor(tests: ReliabilityTestSummary[]) {
  if (tests.length === 0) {
    return ["No tests to report."];
  }

  return [
    "| Project | Test | File | Duration | Retries | Outcome |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...tests.map(
      (test) =>
        `| ${escapeMarkdown(test.project)} | ${escapeMarkdown(test.title)} | ${escapeMarkdown(
          test.file
        )} | ${formatDuration(test.durationMs)} | ${test.retries} | ${test.outcome} |`
    ),
  ];
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

export default ReliabilityReporter;
