import styled from "@emotion/styled";
import { Link, Typography } from "@mui/material";
import { Box } from "@mui/system";

const JBox = styled(Box)({
  maxWidth: 1280,
  ml: 'auto',
  mr: 'auto'
});

const BodySectionTypography = styled(Typography)({
  variant:"body1",
  component:"p",
  fontSize: '1rem',
});


/**
 * 実況スレ確認タブページ
 */
export default function JPage() {
  return (
    <JBox>
      <BodySectionTypography>
        <Link href="https://docs.google.com/spreadsheets/d/1F26VrVqT-5cpsVrYCagZxouDRumJhtcYD7zGECT6Eac/edit?usp=sharing" rel="noopener noreferrer" target="_blank" underline="always">Youtube動画IDと実況スレを紐づけたスプレッドシート</Link>
        <br /><br />
      </BodySectionTypography>
      <BodySectionTypography>
        上記スプレッドシート上でYoutube動画IDと5ch実況スレの紐づけを行っています。<br />
        スプレッドシートの内容を定期的に取り込みKoyoKoyoTubeにコメントを反映するようになっています。<br />
        再生リストや動画一覧にないYoutube動画IDについては動画閲覧ページのURLを変更してください。<br />
        <br />
        例） https://koyokoyotube.web.app/watch/Youtube動画ID
      </BodySectionTypography>
    </JBox>
  );
}
