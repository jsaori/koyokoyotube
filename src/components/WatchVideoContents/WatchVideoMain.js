import { memo, useMemo, useState } from "react";

import styled from "@emotion/styled";
import { Box } from "@mui/material";

import { WatchVideoNavigation } from "./WatchVideoNavigation";
import { WatchVideoPlayer } from "./WatchVideoPlayer";
import { useFireStorage } from "../../hooks/useFireStorage";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainContainer = styled(Box)({
  boxShadow: "0 1px 8px rgb(0 0 0 / 10%)",
  marginBottom: 16,
  position: "relative",
  display: "flex",
  flexDirection: "row"
});
//#endregion

/**
 * 動画関連メイン部
 */
export const WatchVideoMain = memo(({ sx, id }) => {
  // 動画idに紐づくコメントリストを取得
  let thread = useFireStorage(`data/comments/${id}/thread.gz`, null);
  const sortedThread = useMemo(() => {
    if (!thread) return null;
    // ソートのコストを考慮しメモ化
    thread.data.comments = thread.data.comments.sort((a, b) => a.posMs - b.posMs);
    return thread;
  }, [thread]);

  // ナビゲーションパネルにコメント非表示ボタンを設置する
  // それにともないナビゲーションパネルにおける変更をここで検知しプレイヤーにわたす必要がある
  const [commentDisp, setCommentDisp] = useState(true);
  const handleChangeCommentDisp = () => {
    setCommentDisp(!commentDisp);
  };

  // 流れたコメントのインデックスを管理しコメントリストを動作させる
  const [commentIndex, setCommentIndex] = useState(0);
  const handleCommentIndex = (index) => {
    setCommentIndex(index);
  };

  return (
    <WatchVideoMainContainer {...sx}>
      {/**
       * プレイヤー & メディア表示
       */}
      <WatchVideoPlayer id={id} thread={sortedThread} commentDisp={commentDisp} handleCommentIndex={handleCommentIndex} />
      {/**
       * ナビゲーションパネル
       */}
      <WatchVideoNavigation id={id} thread={sortedThread} commentDisp={commentDisp} handleChangeCommentDisp={handleChangeCommentDisp} commentIndex={commentIndex} />
    </WatchVideoMainContainer>
  )
});