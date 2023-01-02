import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { PendingThread } from "../components/PendingThread/PendingThread";
import { RegistThread } from "../components/RegistThread/RegistThread";

//#region ユーザー定義スタイルコンポーネント
const JBox = styled(Box)({
  maxWidth: "100%",
  marginLeft: 16,
  marginRight: 16,
  paddingBottom: 40
});

const BodySectionTypography = styled(Typography)({
  variant:"body1",
  component:"p",
  fontSize: '1rem',
});

//#endregion

/**
 * 実況スレ登録タブページ
 */
export default function JPage() {
  return (
    <JBox>
      <BodySectionTypography>
        実況スレ登録ページです. 定期的に実行される処理にてコメントに反映されます.
      </BodySectionTypography>
      <RegistThread />
      <PendingThread sx={{ pt: 5 }} />
    </JBox>
  );
}
