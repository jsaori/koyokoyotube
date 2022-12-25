import { memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styled from "@emotion/styled";
import { Box, Pagination, Typography } from "@mui/material";
import queryString from "query-string";

import { SearchBar } from "../SearchBar/SearchBar";
import { isMobile } from "react-device-detect";

//#region ユーザー定義スタイルコンポーネント
const VideoListSelect = styled("select")(({ theme }) => ({
  height: 32,
  width: 194,
  fontSize: 13,
  color: theme.palette.control.contrastText,
  backgroundColor: theme.palette.control.light,
  border: "2px solid",
  borderColor: theme.palette.control.dark
}));

const VideoListMenuMain = styled(Box)(({ theme }) => ({
  alignItems: "center"
}));

const VideoListMenuContainer = styled(Box)(({ theme }) => ({
  marginTop: 16,
  display: "flex",
  flexDirection: !isMobile ? "row" : "column",
  justifyContent: "space-between"
}));

const VideoListPagenation = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: !isMobile ? 0 : 10
}));
//#endregion

export const VideoListMenu = memo(({ sx, videoCount, page, sort }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = queryString.parse(location.search);

  // ページ変更イベント
  const handlePageChange = (event, value) => {
    let queryStr = "";
    query.page = value;
    Object.keys(query).forEach((key, index) => {
      if (queryStr !== "") queryStr += "&";
      queryStr += key + "=" + query[key];
    });
    navigate({
      pathname: location.pathname,
      search: queryStr
    })
  };

  // ドロップダウン変更イベント
  const handleSelectChange = (e) => {
    let queryStr = "";
    query.sort = e.target.value;
    Object.keys(query).forEach((key, index) => {
      if (queryStr !== "") queryStr += "&";
      queryStr += key + "=" + query[key];
    });
    navigate({
      pathname: location.pathname,
      search: queryStr
    })
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