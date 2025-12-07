import { memo } from "react";

import { Box, Pagination, useMediaQuery, useTheme } from "@mui/material";
import styled from "@emotion/styled";

import { useQueryString } from "../../hooks/useQueryString";

//#region ユーザー定義スタイルコンポーネント
const VideoListFooterMain = styled(Box)(({ theme }) => ({
  alignItems: "center",
  display: "flex",
  float: "right"
}));
//#endregion

export const VideoListFooter = memo(({ sx, videoCount, page }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { updateQuery } = useQueryString();

  // ページ変更イベント
  const handlePageChange = (event, value) => {
    updateQuery({ page: value });
  };

  return (
    <VideoListFooterMain {...sx}>
      <Pagination count={Math.ceil(videoCount / 50)} page={page} onChange={handlePageChange} shape="rounded" size={!isMobile ? "medium" : "small"} />
    </VideoListFooterMain>
  )
});