import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { ThemeProvider, StyledEngineProvider } from "@mui/material";

import AppGoogle from "./containers/AppGoogle";
import { history } from "./utils/historyUtils";
import { appTheme } from "./theme";

const root = createRoot(document.getElementById("root")!);

if (process.env.VITE_GOOGLE) {
  /* istanbul ignore next */
  root.render(
    <Router history={history}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={appTheme}>
          <AppGoogle />
        </ThemeProvider>
      </StyledEngineProvider>
    </Router>
  );
} else {
  console.error("Google is not configured.");
}
