import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5eead4",
      light: "#99f6e4",
      dark: "#2dd4bf",
      contrastText: "#0f1419",
    },
    secondary: {
      main: "#94a3b8",
      contrastText: "#0f1419",
    },
    background: {
      default: "#0f1419",
      paper: "#1a2332",
    },
    success: {
      main: "#34d399",
      light: "#6ee7b7",
      dark: "#10b981",
      contrastText: "#0f1419",
    },
    error: {
      main: "#f87171",
      light: "#fca5a5",
      dark: "#ef4444",
      contrastText: "#0f1419",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },
  typography: {
    fontSize: 14 * 0.875,
    body1: {
      lineHeight: 1.43,
      letterSpacing: "0.01071em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f1419",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: "6px 0 7px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          padding: "6px 0 7px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a2332",
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a2332",
          backgroundImage: "none",
        },
      },
    },
  },
});
