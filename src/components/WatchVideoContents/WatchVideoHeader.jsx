import { memo } from "react";

import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoHeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: 16,
  marginTop: 16,
  position: "relative",
  height: 21,
  whiteSpace: "nowrap",
  overflow: "hidden"
}));
//#endregion

/**
 * 動画ヘッダ部
 */
export const WatchVideoHeader = memo(({ sx, title }) => {
  return (
    <WatchVideoHeaderContainer {...sx}>
      <Typography variant="h1" fontSize={18} fontWeight={600}>{title}</Typography>
    </WatchVideoHeaderContainer>
  )
});