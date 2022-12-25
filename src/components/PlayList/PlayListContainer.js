import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, List } from "@mui/material";

import { VideoListItem } from "../VideoList/VideoListItem";
import { PlayListHeader } from "./PlayListHeader";
import { PlayListMenu } from "./PlayListMenu";
import { isMobile } from "react-device-detect";

/**
 * 特定再生リストのコンテンツ一覧
 */
export const PlayListContainer = memo(({ sx, playlistData, listId }) => {
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

  const sortChange = useCallback((prev, current) => {
    let comparison = 0;
    if (sort === "publishDesc") {
      comparison = new Date(current.publishedAt) - new Date(prev.publishedAt);
    } else if (sort === "publishAsc") {
      comparison = new Date(prev.publishedAt) - new Date(current.publishedAt);
    } else if (sort === "durationDesc") {
      comparison = Number(current.duration) - Number(prev.duration);
    } else if (sort === "durationAsc") {
      comparison = Number(prev.duration) - Number(current.duration);
    } else if (sort === "titleDesc") {
      comparison = current.title < prev.title ? 1 : -1;
    } else if (sort === "titleAsc") {
      comparison = prev.title < current.title ? 1 : -1;
    } else {
      comparison = 0;
    }
    return comparison;
  }, [sort]);

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
        {playlistData.videos.sort(sortChange).filter(v => v).map((video, index) => (
          <Box
            key={index}
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
                mb: playlistData.videos.length - 1 === index ? 3 : 0
              }}
            />
            {playlistData.videos.length - 1 > index && <Divider sx={{ pt: !isMobile ? 2 : 0.5, mb: !isMobile ? 2 : 0.5 }} />}
          </Box>
        ))}
      </List>
    </Box>
  )
});