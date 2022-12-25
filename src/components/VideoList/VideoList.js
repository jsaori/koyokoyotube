import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, List } from "@mui/material";
import { VideoListFooter } from "./VideoListFooter";
import { VideoListItem } from "./VideoListItem";
import { VideoListMenu } from "./VideoListMenu";
import { isMobile } from "react-device-detect";

/**
 * 動画一覧
 */
export const VideoList = memo(({ sx, videoData }) => {
  const location = useLocation();
  const [page, setPage] = useState(0);
  const query = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location]);
  useEffect(() => {
    if (query.get('page')) {
      setPage(Number(query.get('page')));
    } else {
      setPage(1);
    }
    window.scrollTo(0, 0);
  }, [query]);

  const [searchList, setSearchList] = useState(null);
  useEffect(() => {
    const search = query.get('search_query') !== null ? query.get('search_query') : "";
    setSearchList(videoData.filter((video) => {
      const reg = new RegExp(search, 'i');
      return (reg.test(video.title));
    }));
  }, [query, videoData]);

  const [sort, setSort] = useState("publishDesc");
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
      {!searchList ? (
        <Box
          sx={{
            height: window.innerHeight * 2
          }}
        />
      ) : (
        <>
          {!searchList.length ? (
            <>
              {/**
                * ヘッダ
                */}
              <VideoListMenu
                videoCount={searchList.length}
                sx={{ mb: 3 }}
                page={page > 0 ? page : 1}
                sort={sort}
              />
              <div>キーワードに一致する結果が見つかりませんでした</div>
            </>
          ) : (
            <>
              {/**
                * ヘッダ
                */}
              <VideoListMenu
                videoCount={searchList.length}
                sx={{ mb: 3 }}
                page={page > 0 ? page : 1}
                sort={sort}
              />
              <List disablePadding>
                {/**
                 * コンテンツリスト
                 */}
                {searchList.sort(sortChange).slice((page - 1) * 50, page * 50).map((video, index) => (
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
                      sx={{
                        mb: searchList.length - 1 === index ? 4 : 0
                      }}
                    />
                    {searchList.length - 1 > index && <Divider sx={{ pt: !isMobile ? 2 : 0.5, mb: !isMobile ? 2 : 0.5 }} />}
                  </Box>
                ))}
              </List>
              <VideoListFooter
                videoCount={searchList.length}
                sx={{ mb: 3 }}
                page={page > 0 ? page : 1}
              />
            </>
          )}
        </>
      )}
    </Box>
  )
});