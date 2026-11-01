import { memo, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { Box, Divider, List, useMediaQuery, useTheme } from "@mui/material";
import { VideoListFooter } from "./VideoListFooter";
import { VideoListItem } from "./VideoListItem";
import { VideoListMenu } from "./VideoListMenu";
import { createSortFunction } from "../../libs/utilities";

/**
 * 動画一覧
 */
export const VideoList = memo(({ sx, videoData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  const searchList = useMemo(() => {
    const search = query.get('search_query') !== null ? query.get('search_query') : "";
    // 空欄の場合は全件表示
    if (search === "") {
      // IDで重複排除（最初に出現したIDのみを保持）
      const uniqueMap = new Map();
      videoData.forEach((video) => {
        if (!uniqueMap.has(video.id)) {
          uniqueMap.set(video.id, video);
        }
      });
      return Array.from(uniqueMap.values());
    }
    // 検索クエリがある場合はフィルタリング
    const filtered = videoData.filter((video) => {
      const reg = new RegExp(search, 'i');
      return (reg.test(video.title));
    });
    // IDで重複排除（最初に出現したIDのみを保持）
    const uniqueMap = new Map();
    filtered.forEach((video) => {
      if (!uniqueMap.has(video.id)) {
        uniqueMap.set(video.id, video);
      }
    });
    return Array.from(uniqueMap.values());
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

  const sortChange = useMemo(() => createSortFunction(sort), [sort]);

  const sortedAndPaginatedVideos = useMemo(() => {
    if (!searchList) return [];
    return [...searchList].sort(sortChange).slice((page - 1) * 50, page * 50);
  }, [searchList, sortChange, page]);

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
                {sortedAndPaginatedVideos.map((video, index, array) => (
                  <Box
                    key={video.id}
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
                        mb: array.length - 1 === index ? 4 : 0
                      }}
                    />
                    {array.length - 1 > index && <Divider sx={{ pt: !isMobile ? 2 : 0.5, mb: !isMobile ? 2 : 0.5 }} />}
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