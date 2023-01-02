import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import { PendingThread } from "../components/PendingThread/PendingThread";
import { RegistThread } from "../components/RegistThread/RegistThread";

//#region ユーザー定義スタイルコンポーネント
const JBox = styled(Box)({
  maxWidth: "100%",
  marginLeft: 16,
  marginRight: 16,
  paddingBottom: 40
});

const SubSectionTypography = styled(Typography)({
  variant:"h2",
  fontSize: '1.2rem',
  marginBottom:'1rem'
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
      <SubSectionTypography>
        🧪実況スレ登録🧪
      </SubSectionTypography>
      <BodySectionTypography>
        Youtubeの動画に5ch実況スレを登録することができます.<br />
        現在は１時間に１動画分のコメント生成を行っています.<br /><br />
        「同時視聴」はアーカイブを実況したスレを登録する際に使用します.<br />
        ※旧スプシの同時視聴／現スプシのセルフに対応します※<br />
      </BodySectionTypography>
      <RegistThread />
      <PendingThread sx={{ pt: 5 }} />
    </JBox>
  );
}
