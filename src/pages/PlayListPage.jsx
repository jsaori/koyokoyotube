import { PlayListSideContainer } from "../components/SideContainer/PlayListSideContainer";
import { PlayList } from "../components/PlayList/PlayList";
import { useFireStorage } from "../hooks/useFireStorage";
import { CHANNEL_ID_LIST } from "../libs/constants";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { LoadingPlaceholder } from "../components/shared/LoadingPlaceholder";
import { TabPageBox } from "../components/shared/StyledComponents";

/**
 * チャンネルページ内の再生リストタブページ
 */
 export default function PlayListPage({ chname }) {
  const { isMobile } = useBreakpoint();
  const playlist = useFireStorage(`data/playlist/${CHANNEL_ID_LIST[chname]}/playlist.gz`, null);

  return (
    <TabPageBox>
      {/**
       * ページ遷移時videosはnullなのでスクロールバー非表示->表示で画面がガタガタする
       * nullの場合は画面サイズを適当に大きくして対策(ニコニコ動画もそんな挙動だった)
       */}
      {!playlist ? (
        <LoadingPlaceholder />
      ) : (
        <>
          {!isMobile && <PlayListSideContainer sx={{mr: 4, width: 216}} playlistData={playlist.data.playlists} />}
          <PlayList sx={{ width: isMobile ? "100%" : 716 }} playlistData={playlist.data.playlists} />
        </>
      )}
    </TabPageBox>
  )
}
