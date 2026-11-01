import { memo, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Box, List, Typography, useMediaQuery, useTheme } from "@mui/material";

import { PublicPlayListItem } from "./PublicPlayListItem";
import { SearchBar } from "../SearchBar/SearchBar";

/**
 * 特定再生リストのコンテンツ一覧
 */
export const PublicPlayListContainer = memo(({ sx, playlistData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const query = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location]);

  // 検索クエリに基づいて再生リストをフィルタリング
  const searchList = useMemo(() => {
    const search = query.get('search_query') !== null ? query.get('search_query') : "";
    // 空欄の場合は全件表示
    if (search === "") {
      return playlistData.filter(playlist => playlist.videos.length > 0);
    }
    // 検索クエリがある場合はフィルタリング
    const filtered = playlistData.filter((playlist) => {
      const reg = new RegExp(search, 'i');
      return reg.test(playlist.title) && playlist.videos.length > 0;
    });
    return filtered;
  }, [query, playlistData]);

  return (
    <Box {...sx}>
      <SearchBar placeholder="再生リストを検索" sx={{ height: 36, mb: 2 }} />
      <Typography fontSize={14} ml={1} mb={2}>{searchList.length}件</Typography>
      {searchList.length === 0 ? (
        <Box>キーワードに一致する結果が見つかりませんでした</Box>
      ) : (
        <List disablePadding>
          {searchList.map((playlist, index) => (
            <PublicPlayListItem
              key={playlist.id}
              playlistId={playlist.id}
              playlistTitle={playlist.title}
              updateAt={playlist.updateAt}
              videoCount={playlist.videos.length}
              videos={playlist.videos.filter(v => v).slice(0, 3)}
              sx={{
                mt: (index === 0 || isMobile) ? 0 : 1,
                mb: (index !== searchList.length - 1 || isMobile) ? 0 : 2
              }}
            />
          ))}
        </List>
      )}
    </Box>
  )
});