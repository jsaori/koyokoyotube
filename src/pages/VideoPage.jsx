import { VideoList } from "../components/VideoList/VideoList";
import { VideoListSideContainer } from "../components/SideContainer/VideoListSideContainer";
import { useFireStorage } from "../hooks/useFireStorage";
import { CHANNEL_ID_LIST } from "../libs/constants";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { LoadingPlaceholder } from "../components/shared/LoadingPlaceholder";
import { TabPageBox } from "../components/shared/StyledComponents";

/**
 * チャンネルページ内の動画一覧タブページ
 */
 export default function VideoPage({ chname }) {
  const { isMobile } = useBreakpoint();
  const videos = useFireStorage(`data/video/${CHANNEL_ID_LIST[chname]}/videos.gz`, null);

  return (
    <TabPageBox>
      {/**
       * ページ遷移時videosはnullなのでスクロールバー非表示->表示で画面がガタガタする
       * nullの場合は画面サイズを適当に大きくして対策(ニコニコ動画もそんな挙動だった)
       */}
      {!videos ? (
        <LoadingPlaceholder />
      ) : (
        <>
          {!isMobile && <VideoListSideContainer sx={{mr: 4, width: 216}} />}
          <VideoList sx={{ width: isMobile ? "100%" : 716 }} videoData={videos.data.videos} />
        </>
      )}
    </TabPageBox>
  )
}
