import { memo } from "react";

import styled from "@emotion/styled";
import { Box, Pagination, Typography, useMediaQuery, useTheme } from "@mui/material";

import { SearchBar } from "../SearchBar/SearchBar";
import { ListSelect } from "../shared/StyledComponents";
import { useQueryString } from "../../hooks/useQueryString";

//#region ユーザー定義スタイルコンポーネント
const VideoListSelect = ListSelect;

const VideoListMenuMain = styled(Box)(({ theme }) => ({
  alignItems: "center"
}));

const VideoListMenuContainer = styled(Box)(({ theme }) => ({
  marginTop: 16,
  display: "flex",
  [theme.breakpoints.up('md')]: {
    flexDirection: "row",
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: "column",
  },
  justifyContent: "space-between"
}));

const VideoListPagenation = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  [theme.breakpoints.up('md')]: {
    paddingTop: 0,
  },
  [theme.breakpoints.down('md')]: {
    paddingTop: 10,
  },
}));
//#endregion

export const VideoListMenu = memo(({ sx, videoCount, page, sort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { updateQuery } = useQueryString();

  // ページ変更イベント
  const handlePageChange = (event, value) => {
    updateQuery({ page: value });
  };

  // ドロップダウン変更イベント
  const handleSelectChange = (e) => {
    updateQuery({ sort: e.target.value });
  };

  return (
    <VideoListMenuMain {...sx}>
      <SearchBar placeholder="動画を検索" sx={{ height: 36 }} />
      <Typography fontSize={14} ml={1}>{videoCount}件</Typography>
      {/**
       * 動画のソート選択ドロップダウン
       * 連続再生ボタン
       */}
      <VideoListMenuContainer>
        <VideoListSelect
          value={sort}
          onChange={handleSelectChange}
          sx={{
            maxHeight: 32,
            fontSize: 13
          }}
        >
          <option value="publishDesc">公開日時が新しい順</option>
          <option value="publishAsc">公開日時が古い順</option>
          <option value="durationDesc">再生時間が長い順</option>
          <option value="durationAsc">再生時間が短い順</option>
          <option value="titleDesc">タイトル昇順</option>
          <option value="titleAsc">タイトル降順</option>
        </VideoListSelect>
        <VideoListPagenation>
          <Pagination count={Math.ceil(videoCount / 50)} page={page} onChange={handlePageChange} shape="rounded" size={!isMobile ? "medium" : "small"} />
        </VideoListPagenation>
      </VideoListMenuContainer>
    </VideoListMenuMain>
  )
});