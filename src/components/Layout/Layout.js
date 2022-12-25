import { createContext, memo, useMemo } from "react"
import { Outlet } from "react-router-dom";

import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";

import { useLocalStorage } from "../../hooks/useLocalStrage";
import Header from "../Header/Header";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

/**
 * WEBアプリの共通レイアウト
 * ※必要ならここにHeaderとFooterも含める
 */
export const Layout = memo(function Layout() {
  const [mode, setMode] = useLocalStorage('KoyoKoyoThemeMode', 'light');
  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      const prevMode = mode;
      setMode(prevMode === 'light' ? 'dark' : 'light');
    },
  }), [mode, setMode]);

  const theme = useMemo(() => {
    if (mode === 'light') {
      return createTheme({
        // lightモードテーマ
        palette: {
          mode,
          primary: {
            light: '#ffe6f0',
            main: '#fe68ad',
            dark: '#ff0a7d',
            contrastText: '#fff',
          },
          paper: {
            main: '#ffffff',
            sub: '#fafafa',
            dark: '#f1f1f1',
            contrastText: '#000',
            contrastBorder: '#e0e0e0'
          },
          control: {
            light: '#ffffff',
            main: '#fafafa',
            dark: '#e9e9e9',
            contrastText: '#000',
          }
        },
        typography: {
          fontFamily: [
            'Avenir',
            'Lato',
            '-apple-system',
            'BlinkMacSystemFont',
            'Helvetica Neue',
            'Hiragino Kaku Gothic ProN',
            'Meiryo',
            'メイリオ',
            'sans-serif'
          ].join(','),
        }
      });
    } else {
      return createTheme({
        // darkモードテーマ
        palette: {
          mode,
          primary: {
            light: '#806070',
            main: '#ffacd3',
            dark: '#fef5f5',
            contrastText: '#000',
          },
          paper: {
            main: '#313131',
            sub: '#282828',
            dark: '#181818',
            contrastText: '#fff',
            contrastBorder: '#505050'
          },
          control: {
            light: '#212121',
            main: '#191919',
            dark: '#353535',
            contrastText: '#ddd',
          }
        },
        typography: {
          fontFamily: [
            'Avenir',
            'Lato',
            '-apple-system',
            'BlinkMacSystemFont',
            'Helvetica Neue',
            'Hiragino Kaku Gothic ProN',
            'Meiryo',
            'メイリオ',
            'sans-serif'
          ].join(','),
        }
      });
    }
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: theme.palette.paper.sub
          }}
        >
          <Header />
          <Outlet />
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
});