import { memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Pagination } from "@mui/material";
import queryString from "query-string";
import styled from "@emotion/styled";
import { isMobile } from "react-device-detect";

//#region ユーザー定義スタイルコンポーネント
const VideoListFooterMain = styled(Box)(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  float: "right"
}));
//#endregion

export const VideoListFooter = memo(({ sx, videoCount, page }) => {
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

  return (
    <VideoListFooterMain {...sx}>
      <Pagination count={Math.ceil(videoCount / 50)} page={page} onChange={handlePageChange} shape="rounded" size={!isMobile ? "medium" : "small"} />
    </VideoListFooterMain>
  )
});