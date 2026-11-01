import { Box } from "@mui/material";
import { useWindowSize } from "../../hooks/useWindowSize";

/**
 * ローディング中のプレースホルダーコンポーネント
 * ページ遷移時videosはnullなのでスクロールバー非表示->表示で画面がガタガタする
 * nullの場合は画面サイズを適当に大きくして対策(ニコニコ動画もそんな挙動だった)
 */
export const LoadingPlaceholder = () => {
  const { height } = useWindowSize();

  return (
    <Box
      sx={{
        height: height * 2
      }}
    />
  );
};
