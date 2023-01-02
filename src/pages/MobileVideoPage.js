import styled from "@emotion/styled";

import { Box } from "@mui/material";

import { VideoList } from "../components/VideoList/VideoList";
import { useFireStorage } from "../hooks/useFireStorage";
import { CHANNEL_ID_LIST } from "../libs/constants";

const VideoBox = styled(Box)({
  display: "flex",
  width: "100%"
});

/**
 * チャンネルページ内の動画一覧タブページ
 */
 export default function MobileVideoPage({ chname }) {
  const videos = useFireStorage(`data/video/${CHANNEL_ID_LIST[chname]}/videos.json`, null);

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
          <VideoList sx={{ width: "100%" }} videoData={videos.data.videos} />
        </>
      )}
    </VideoBox>
  )
}
