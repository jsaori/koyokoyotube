import { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Box } from "@mui/material";

import { PlayListContainer } from "./PlayListContainer";
import { PublicPlayListContainer } from "./PublicPlayListContainer";

/**
 * 特定再生リストのコンテンツ一覧
 */
export const PlayList = memo(({ sx, playlistData }) => {
  // URLパラメータ解析
  const param = useParams();

  const [listId, setListId] = useState(0);
  useEffect(() => {
    const id = param.listid !== undefined ? param.listid : 0;
    setListId(id);
    window.scrollTo(0, 0);
  }, [param.listid]);

  return (
    <Box {...sx}>
      {listId === 0 ? (
        <PublicPlayListContainer key="public" playlistData={playlistData || []} />
      ) : (
        (() => {
          const foundPlaylist = playlistData?.find(playlist => playlist.id === listId);
          return foundPlaylist ? (
            <PlayListContainer key={listId} playlistData={foundPlaylist} listId={listId} />
          ) : null;
        })()
      )}
    </Box>
  )
});