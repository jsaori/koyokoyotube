import styled from "@emotion/styled";
import { Box, Chip, Stack, Typography } from "@mui/material";
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

const DescriptionBox = styled(Box)(({ theme }) => ({
  padding: '16px 20px',
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.02)',
  marginBottom: '24px',
}));

const FeatureChip = styled(Chip)({
  height: '28px',
  fontSize: '0.875rem',
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
      <DescriptionBox>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          YouTube動画に5ch実況スレを登録すると、コメント作成が自動的に開始されます
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <FeatureChip label="数分で完了" size="small" color="primary" variant="outlined" />
          <FeatureChip label="編集・削除に対応しました" size="small" color="primary" variant="outlined" />
        </Stack>
        <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
          💡 「同時視聴」はアーカイブ実況スレ登録時に使用します
        </Typography>
      </DescriptionBox>
      <RegistThread />
      <SubSectionTypography sx={{ mt: 5 }}>
        🧪処理中情報🧪
      </SubSectionTypography>
      <DescriptionBox>
        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
          登録された実況スレの処理状況をリアルタイムで表示します
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          処理が完了すると、ここから表示が消えます（通常、数分程度かかります）
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.disabled', fontSize: '0.75rem' }}>
          💡 動画にコメントが反映されていない場合、キャッシュを削除すれば反映されるかもしれません
        </Typography>
      </DescriptionBox>
      <PendingThread />
    </JBox>
  );
}
