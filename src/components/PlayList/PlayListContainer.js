import { memo, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, List, useMediaQuery, useTheme } from "@mui/material";

import { VideoListItem } from "../VideoList/VideoListItem";
import { PlayListHeader } from "./PlayListHeader";
import { PlayListMenu } from "./PlayListMenu";
import { createSortFunction } from "../../libs/utilities";

/**
 * 特定再生リストのコンテンツ一覧
 */
export const PlayListContainer = memo(({ sx, playlistData, listId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [sort, setSort] = useState("publishDesc");
  const query = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location]);

  useEffect(() => {
    if (!query) return;
    if (query.get('sort')) {
      setSort(query.get('sort'));
    } else {
      setSort("publishDesc");
    }
  }, [query]);

  const sortChange = useMemo(() => createSortFunction(sort), [sort]);

  const sortedVideos = useMemo(() => {
    if (!playlistData || !playlistData.videos) return [];
    return [...playlistData.videos].sort(sortChange).filter(v => v);
  }, [playlistData?.videos, sortChange]);

  if (!playlistData || !playlistData.videos) {
    return null;
  }

  return (
    <Box {...sx}>
      {/**
       * ヘッダ
       */}
      <PlayListHeader
        listTitle={playlistData.title}
        listVideoCount={playlistData.videos.length}
        updateAt={playlistData.updateAt}
      />
      {/**
        * メニュー
        */}
      <PlayListMenu sx={{ mb: 2 }} sort={sort} />
      <List disablePadding>
        {/**
         * コンテンツリスト
         */}
        {sortedVideos.map((video, index, array) => (
          <Box
            key={`${listId}-${video.id}-${index}`}
          >
            <VideoListItem
              videoId={video.id}
              videoTitle={video.title}
              publishedAt={video.publishedAt}
              startTime={video.startTime}
              endTime={video.endTime}
              duration={video.duration}
              comments={video.comments}
              listId={listId}
              sort={sort}
              sx={{
                mb: array.length - 1 === index ? 3 : 0
              }}
            />
            {array.length - 1 > index && <Divider sx={{ pt: !isMobile ? 2 : 0.5, mb: !isMobile ? 2 : 0.5 }} />}
          </Box>
        ))}
      </List>
    </Box>
  )
});