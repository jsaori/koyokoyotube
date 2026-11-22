import { useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import styled from "@emotion/styled";
import { AppBar, Box, IconButton, Link, Toolbar } from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from "@emotion/react";

import { ColorModeContext } from "../Layout/Layout";

//#region ユーザー定義スタイルコンポーネント
const HeaderMainWidthBox = styled(Box)({
  margin: '0 auto'
});
//#endregion

/**
 * WEBアプリの共通ヘッダ
 */
export default function Header() {
  // 共通テーマ
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const location = useLocation();

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        color="primary"
        enableColorOnDark
      >
        <Toolbar
          variant="dense"
        >
          <HeaderMainWidthBox
            sx={{
              width: location.pathname.match(/watch/) === null ? 1280 : 1590
            }}
          >
            <Link
              component={RouterLink}
              to="/"
              color="inherit"
              underline="none"
            >
              🧪KoyoKoyoTube🧪
            </Link>
            <IconButton
              color="inherit"
              onClick={() => {
                colorMode.toggleColorMode();
              }}
              sx={{
                ml: 3
              }}
            >
              {theme.palette.mode === 'light' ? <LightModeIcon /> : <DarkModeIcon /> }
            </IconButton>
          </HeaderMainWidthBox>
        </Toolbar>
      </AppBar>
      <Toolbar
        variant="dense"
      />
    </>
  )
}
