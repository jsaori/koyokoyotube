import styled from "@emotion/styled";
import { Box, Button, ListItem, ListItemButton } from "@mui/material";

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

// サイドコンテナ系の共通スタイル
export const SideContainerListItem = styled(ListItem)(({ theme }) => ({
  dense: "true",
  height: 40
}));

export const SideContainerListItemButton = styled(ListItemButton)(({ theme }) => ({
  height: 40,
  '&.Mui-selected': {
    color: theme.palette.primary.dark,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    }
  },
  '&:hover, &.Mui-selected:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    }
  }
}));

// チャンネルページ内のタブページ共通スタイル
export const TabPageBox = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  [theme.breakpoints.down('md')]: {
    paddingLeft: 8,
    paddingRight: 8,
  },
}));
