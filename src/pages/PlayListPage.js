import styled from "@emotion/styled";
import { Box } from "@mui/material";

import { PlayListSideContainer } from "../components/SideContainer/PlayListSideContainer";
import { PlayList } from "../components/PlayList/PlayList";
import { useFireStorage } from "../hooks/useFireStorage";
import { CHANNEL_ID_LIST } from "../libs/constants";

const PlayListBox = styled(Box)({
  display: "flex",
  width: "100%"
});

/**
 * チャンネルページ内の再生リストタブページ
 */
 export default function PlayListPage({ chname }) {
  const playlist = useFireStorage(`data/playlist/${CHANNEL_ID_LIST[chname]}/playlist.gz`, null);

  return (
    <PlayListBox>
      {/**
       * ページ遷移時videosはnullなのでスクロールバー非表示->表示で画面がガタガタする
       * nullの場合は画面サイズを適当に大きくして対策(ニコニコ動画もそんな挙動だった)
       */}
      {!playlist ? (
        <Box
          sx={{
            height: window.innerHeight * 2
          }}
        />
      ) : (
        <>
          <PlayListSideContainer sx={{mr: 4, width: 216}} playlistData={playlist.data.playlists} />
          <PlayList sx={{ width: 716 }} playlistData={playlist.data.playlists} />
        </>
      )}
    </PlayListBox>
  )
}
