import { memo } from "react";

import { Box, Divider, Typography } from "@mui/material";
import { format } from "date-fns";
import styled from "@emotion/styled";

//#region ユーザー定義スタイルコンポーネント
const PlayListHeaderMain = styled(Box)(({ theme }) => ({
  marginBottom: 24,
  marginTop: 8,
  position: "relative",
}));

const PlayListHeaderText = styled(Box)(({ theme }) => ({
  flex: "1 1 1px"
}));
//#endregion

export const PlayListHeader = memo(({ sx, listTitle, listVideoCount, updateAt }) => {
  const updateDate = new Date(updateAt);

  return (
    <PlayListHeaderMain {...sx}>
      <PlayListHeaderText>
        <Typography variant="h1" fontSize={18} fontWeight={600} >{listTitle}</Typography>
        <Typography fontSize={14} mt={1}>{listVideoCount}本の動画 | 最終更新日: {format(updateDate, 'yyyy/MM/dd')}</Typography>
      </PlayListHeaderText>
      <Divider sx={{pb: 3}} />
    </PlayListHeaderMain>
  )
});