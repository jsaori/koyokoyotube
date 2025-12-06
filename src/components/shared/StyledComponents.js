import styled from "@emotion/styled";
import { Box, Button } from "@mui/material";

/**
 * 共通スタイルコンポーネント
 * 複数のコンポーネントで使用されるスタイルを共通化
 */

// WatchVideoContents系の共通スタイル
export const WatchVideoMainPanelMenuContainer = styled(Box)(({ theme }) => ({
  borderBottom: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  height: 40,
  paddingLeft: 16,
  paddingRight: 8,
  display: "table",
  position: "relative",
  width: "100%"
}));

export const WatchVideoMainPanelMenuContents = styled(Box)(({ theme }) => ({
  verticalAlign: "middle",
  boxSizing: "border-box",
  display: "table-cell",
  minWidth: 1,
  position: "relative",
}));

// リストメニュー系の共通スタイル
export const ListSelect = styled("select")(({ theme }) => ({
  height: 32,
  fontSize: 13,
  color: theme.palette.control.contrastText,
  backgroundColor: theme.palette.control.light,
  border: "2px solid",
  borderColor: theme.palette.control.dark,
  [theme.breakpoints.up('md')]: {
    width: 194,
  },
  [theme.breakpoints.down('md')]: {
    width: "100%",
  },
}));

// フォーム系の共通スタイル
export const FormCommitButton = styled(Button)((theme) => ({
  marginTop: 16,
  width: 70
}));
