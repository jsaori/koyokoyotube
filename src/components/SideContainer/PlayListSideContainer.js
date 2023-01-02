import { memo, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Box, List } from "@mui/material";

import { PlayListSideContainerIconItem, PlayListSideContainerItem } from "./PlayListSideContainerItem";

/**
 * サイドバーリスト
 * 再生リスト一覧用
 */
export const PlayListSideContainer = memo(({ sx, playlistData }) => {
  // URLパラメータ解析
  const param = useParams();

  // 選択されている再生リストをURLから判定
  const [listId, setListId] = useState(0);
  useMemo(() => {
    const id = param.listid !== undefined ? param.listid : 0;
    setListId(id);
  }, [param.listid]);

  return (
    <Box {...sx}>
      <List disablePadding>
        <PlayListSideContainerItem text="再生リスト一覧" selected={listId === 0} />
        {playlistData.map((playlist, index) => (
          <PlayListSideContainerIconItem
            key={index}
            text={playlist.title}
            listId={playlist.id}
            selected={listId === playlist.id}
          />
        ))}
      </List>
    </Box>
  )
});