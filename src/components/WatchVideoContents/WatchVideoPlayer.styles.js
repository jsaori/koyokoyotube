import { Box, IconButton } from "@mui/material";
import styled from "@emotion/styled";

//#region ユーザー定義スタイルコンポーネント
export const WatchVideoMainPlayerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "black",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up('md')]: {
    width: "calc(100% - 384px)",
    minWidth: 640,
  },
  [theme.breakpoints.down('md')]: {
    width: "100%",
  },
}));

export const WatchVideoMainPlayer = styled(Box)(({ theme, isFullscreen }) => ({
  backgroundColor: "black",
  ...(isFullscreen ? {
    width: "min(100vw, 100vh * 640 / 360)",
    height: "min(100vh, 100vw * 360 / 640)",
    aspectRatio: "640/360",
  } : {
    aspectRatio: "640/360",
  }),
  overflow: "hidden",
  position: "relative",
}));

export const WatchVideoMainPlayerLayer = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
}));

export const FullscreenExitButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 1000,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
}));

export const WatchVideoMediaArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

export const WatchVideoMediaBox = styled(Box)(({ theme }) => ({
  background: theme.palette.control.light,
  height: 70,
  overflow: "hidden",
  position: "relative",
  width: "100%",
  borderRight: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 12px",
}));

export const WatchVideoMediaScrollContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  overflowX: "auto",
  overflowY: "hidden",
  width: "100%",
  height: "100%",
  scrollBehavior: "smooth",
  gap: 8,
  "&::-webkit-scrollbar": {
    height: 4,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.primary.main,
    borderRadius: 2,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: theme.palette.primary.dark,
  },
}));

export const WatchVideoMediaItem = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  position: "relative",
  "& img": {
    height: "100%",
    width: "auto",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid",
    borderColor: theme.palette.control.dark,
    backgroundColor: theme.palette.control.main,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    },
  },
}));

export const WatchVideoMediaArrowLeft = styled(WatchVideoMediaArrowButton)({
  left: 4,
});

export const WatchVideoMediaArrowRight = styled(WatchVideoMediaArrowButton)({
  right: 4,
});
//#endregion

