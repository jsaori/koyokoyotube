import { memo } from "react";

import { Box, ListItem, ListItemButton, Typography } from "@mui/material";
import styled from "@emotion/styled";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { format } from "date-fns";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { usePlayingVideo } from "../../hooks/usePlayingVideo";
import { useTheme } from "@emotion/react";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoPlaylistMain = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  [theme.breakpoints.up('md')]: {
    position: "absolute",
  },
  [theme.breakpoints.down('md')]: {
    position: "relative",
  },
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
  [theme.breakpoints.up('md')]: {
    height: "100%",
  },
  [theme.breakpoints.down('md')]: {
    height: `calc(100vh - 440px)`,
  },
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
  flexShrink: 0,
  [theme.breakpoints.up('md')]: {
    width: 96,
  },
  [theme.breakpoints.down('md')]: {
    width: 64,
  },
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

// 再生リストカード用のスタイル
const PlaylistCardGroup = styled(Box)(({ theme }) => ({
  marginBottom: "12px",
  borderRadius: "8px",
  backgroundColor: theme.palette.paper.light || theme.palette.background.paper,
  border: `1px solid ${theme.palette.paper.contrastBorder || theme.palette.divider}`,
  overflow: "hidden",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    borderColor: theme.palette.primary.main,
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

const PlaylistCardButton = styled(ListItemButton)(({ theme, isSelected }) => ({
  padding: "12px 16px",
  backgroundColor: isSelected ? theme.palette.action.selected || theme.palette.action.hover : "transparent",
  borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : "3px solid transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PlaylistCardContent = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  gap: "12px",
}));

const PlaylistCardThumbnail = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: "4px",
  flexShrink: 0,
  width: 96,
  height: 54,
  objectFit: "cover",
}));

const PlaylistCardInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}));

const PlaylistCardTitle = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.4,
  color: theme.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
}));

const PlaylistCardMeta = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}));

const PlaylistListContainer = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  overflowX: "hidden",
  padding: "8px",
  [theme.breakpoints.up('md')]: {
    height: "100%",
  },
  [theme.breakpoints.down('md')]: {
    height: `calc(100vh - 500px)`,
  },
}));
//#endregion

/**
 * 動画連続再生に対応する関連動画表示部
 */
export const WatchVideoPlaylist = memo(({ sx, id }) => {
  // URLパラメータからプレイリスト情報を取得
  const { 
    playlistTitle, 
    videosData, 
    navigateClickVideo,
    playlistsContainingVideo,
    navigateToPlaylist,
    playlistId,
    channel
  } = usePlayingVideo();

  const theme = useTheme();

  // 再生リストが指定されている場合：既存の動画一覧表示
  if (playlistId && videosData) {
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
    );
  }

  // 再生リストが指定されていない場合：現在の動画が含まれる全再生リストを表示
  return (
    <WatchVideoPlaylistMain>
      <WatchVideoPlaylistHeader>
        <WatchVideoPlaylistHeaderText>
          <WatchVideoPlaylistHeaderSubText>
            この動画が含まれる再生リスト
          </WatchVideoPlaylistHeaderSubText>
          <Box>
            {playlistsContainingVideo.length > 0 
              ? `${playlistsContainingVideo.length}件の再生リスト` 
              : "再生リストが見つかりませんでした"}
          </Box>
        </WatchVideoPlaylistHeaderText>
      </WatchVideoPlaylistHeader>
      <WatchVideoPlaylistContainer>
        <PlaylistListContainer>
          {playlistsContainingVideo.length === 0 ? (
            <Box sx={{ padding: "16px", textAlign: "center", color: theme.palette.text.secondary }}>
              この動画を含む再生リストはありません
            </Box>
          ) : (
            playlistsContainingVideo.map((playlist) => {
              const firstVideo = playlist.videos?.find(v => v);
              const updateDate = new Date(playlist.updateAt);
              const isSelected = playlist.id === playlistId;

              return (
                <PlaylistCardGroup key={playlist.id}>
                  <PlaylistCardButton
                    disableRipple
                    onClick={() => navigateToPlaylist(playlist.id)}
                    isSelected={isSelected}
                  >
                    <PlaylistCardContent>
                      {firstVideo && (
                        <PlaylistCardThumbnail
                          src={`https://i.ytimg.com/vi_webp/${firstVideo.id}/mqdefault.webp`}
                          alt=""
                        />
                      )}
                      <PlaylistCardInfo>
                        <PlaylistCardTitle>
                          {playlist.title}
                        </PlaylistCardTitle>
                        <PlaylistCardMeta>
                          {playlist.videos?.filter(v => v).length || 0}本の動画 | 最終更新: {format(updateDate, 'yyyy/MM/dd')}
                        </PlaylistCardMeta>
                      </PlaylistCardInfo>
                    </PlaylistCardContent>
                  </PlaylistCardButton>
                </PlaylistCardGroup>
              );
            })
          )}
        </PlaylistListContainer>
      </WatchVideoPlaylistContainer>
    </WatchVideoPlaylistMain>
  );
});