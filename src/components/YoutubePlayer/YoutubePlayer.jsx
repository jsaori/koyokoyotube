import { memo } from "react";

/**
 * YoutubePlayerコンポーネント
 * 動画を埋め込む場所の定義と表示設定
 */
export const YoutubePlayer = memo(({ className, id, hidden = false }) => {
  return <div className={className} id={id} hidden={hidden} />;
});