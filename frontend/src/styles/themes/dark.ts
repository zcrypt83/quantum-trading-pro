import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff88',
      contrastText: '#001a23'
    },
    background: {
      default: '#0a1929',
      paper: '#001a23'
    }
  },
  typography: {
    fontFamily: "'Fira Code', monospace",
    fontSize: 12
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#001a23',
          border: '1px solid #00ff88'
        }
      }
    }
  }
});