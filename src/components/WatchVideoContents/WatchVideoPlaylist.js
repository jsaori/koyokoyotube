import { memo } from "react";

import { Box, ListItem, ListItemButton } from "@mui/material";
import styled from "@emotion/styled";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

import { usePlayingVideo } from "../../hooks/usePlayingVideo";
import { useTheme } from "@emotion/react";
import { isMobile } from "react-device-detect";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoPlaylistMain = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  position: !isMobile ? "absolute" : "relative",
  overflow: "hidden"
}));

const WatchVideoPlaylistHeader = styled(Box)(({ theme }) => ({
  minHeight: 48,
  alignItems: "center",
  display: "flex",
  padding: "8px 16px 4px",
  width: "100%",
  borderBottom: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
}));

const WatchVideoPlaylistHeaderText = styled(Box)(({ theme }) => ({
  display: "inline-block",
  flexGrow: 1,
  overflow: "hidden",
  textAlign: "left",
  textOverflow: "ellipsis",
  verticalAlign: "top",
  width: "100%",
  fontSize: 13
}));

const WatchVideoPlaylistHeaderSubText = styled(Box)(({ theme }) => ({
  color: "#999",
  fontSize: 11,
  marginBottom: 4
}));

const WatchVideoPlaylistContainer = styled(Box)(({ theme }) => ({
  height: !isMobile ? "100%" : window.screen.height - 440,
  width: "100%",
  overflow: "hidden",
  position: "relative",
  display: "block"
}));

const WatchVideoPlaylistButton = styled(ListItemButton)(({ theme }) => ({
  padding: "4px 8px",
  alignItems: "center",
  display: "flex",
}));

const WatchVideoPlaylistIcon = styled(Box)(({ theme }) => ({
  marginRight: 8,
  width: 96
}));

const WatchVideoPlaylistTitle = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  wordBreak: "break-all",
  fontSize: 11,
  lineHeight: 1.4,
  maxHeight: "2.8rem",
  overflow: "hidden",
}));
//#endregion

/**
 * 動画連続再生に対応する関連動画表示部
 */
export const WatchVideoPlaylist = memo(({ sx, id }) => {
  // URLパラメータからプレイリスト情報を取得
  const { playlistTitle, videosData, navigateClickVideo } = usePlayingVideo();

  const theme = useTheme();

  // 関連動画アイテム
  const renderRow = ({index, style}) => {
    return (
      <ListItem
        disablePadding
        style={style}
        sx={{
          backgroundColor: videosData[index].id === id ? theme.palette.control.dark : theme.palette.control.main,
          color: videosData[index].id === id ? theme.palette.primary.main : theme.palette.control.contrastText,
        }}
      >
        <WatchVideoPlaylistButton
          disableRipple
          onClick={() => {
            navigateClickVideo(index);
          }}
        >
          <WatchVideoPlaylistIcon
            component="img"
            src={`https://i.ytimg.com/vi_webp/${videosData[index].id}/mqdefault.webp`}
          />
          <WatchVideoPlaylistTitle>
            {videosData[index].title}
          </WatchVideoPlaylistTitle>
        </WatchVideoPlaylistButton>
      </ListItem>
    )
  };

  return (
    <WatchVideoPlaylistMain>
      <WatchVideoPlaylistHeader>
        <WatchVideoPlaylistHeaderText>
          <WatchVideoPlaylistHeaderSubText>
            マイリスト
          </WatchVideoPlaylistHeaderSubText>
          <Box>
            {playlistTitle}
          </Box>
        </WatchVideoPlaylistHeaderText>
      </WatchVideoPlaylistHeader>
      <WatchVideoPlaylistContainer>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              itemCount={videosData ? videosData.length : 0}
              itemSize={62}
              height={height}
              width={width}
            >
              {renderRow}
            </FixedSizeList>
          )}
        </AutoSizer>
      </WatchVideoPlaylistContainer>
    </WatchVideoPlaylistMain>
  )
});