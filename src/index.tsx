import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import App from "./containers/App";
import { history } from "./utils/historyUtils";
import { appTheme } from "./theme";

const root = createRoot(document.getElementById("root")!);

root.render(
  <Router history={history}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={appTheme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </Router>
);
