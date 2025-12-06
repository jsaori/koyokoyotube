import styled from "@emotion/styled";
import { Box, useMediaQuery, useTheme } from "@mui/material";

import { VideoList } from "../components/VideoList/VideoList";
import { VideoListSideContainer } from "../components/SideContainer/VideoListSideContainer";
import { useFireStorage } from "../hooks/useFireStorage";
import { CHANNEL_ID_LIST } from "../libs/constants";

const VideoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  [theme.breakpoints.down('md')]: {
    paddingLeft: 8,
    paddingRight: 8,
  },
}));

/**
 * チャンネルページ内の動画一覧タブページ
 */
 export default function VideoPage({ chname }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const videos = useFireStorage(`data/video/${CHANNEL_ID_LIST[chname]}/videos.gz`, null);

  return (
    <VideoBox>
      {/**
       * ページ遷移時videosはnullなのでスクロールバー非表示->表示で画面がガタガタする
       * nullの場合は画面サイズを適当に大きくして対策(ニコニコ動画もそんな挙動だった)
       */}
      {!videos ? (
        <Box
          sx={{
            height: window.innerHeight * 2
          }}
        />
      ) : (
        <>
          {!isMobile && <VideoListSideContainer sx={{mr: 4, width: 216}} />}
          <VideoList sx={{ width: isMobile ? "100%" : 716 }} videoData={videos.data.videos} />
        </>
      )}
    </VideoBox>
  )
}
