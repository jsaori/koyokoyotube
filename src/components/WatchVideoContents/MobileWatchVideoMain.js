import { memo, useMemo, useState } from "react";

import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { useFullScreenHandle } from "react-full-screen";

import { useFireStorage } from "../../hooks/useFireStorage";
import { MobileWatchVideoPlayer } from "./MobileWatchVideoPlayer";
import { MobileWatchVideoNavigation } from "./MobileWatchVideoNavigation";
import { getTimeStamp } from "../../libs/initYoutube";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainContainer = styled(Box)({
  position: "relative",
  display: "flex",
  flexDirection: "column"
});
//#endregion

/**
 * 動画関連メイン部
 */
export const MobileWatchVideoMain = memo(({ sx, id }) => {
  // 動画idに紐づくコメントリストを取得
  let thread = useFireStorage(`data/comments/${id}/thread.gz`, null);
  const sortedThread = useMemo(() => {
    if (!thread) return null;
    // ソートのコストを考慮しメモ化
    thread.data.comments = thread.data.comments.sort((a, b) => a.posMs - b.posMs);
    return thread;
  }, [thread]);

  // 動画idに紐づくタイムスタンプを取得
  const [timeStamp, setTimeStamp] = useState([]);
  useMemo(() => {
    const getStamp = async () => {
      const stamp = await getTimeStamp(id);
      setTimeStamp(stamp);
    };
    getStamp();
  }, [id]);

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

  const handleFullscreen = useFullScreenHandle();

  return (
    <WatchVideoMainContainer {...sx}>
      {/**
       * プレイヤー & メディア表示
       */}
      <MobileWatchVideoPlayer id={id} thread={sortedThread} commentDisp={commentDisp} handleCommentIndex={handleCommentIndex} handleFullscreen={handleFullscreen} />
      {/**
       * ナビゲーションパネル
       */}
      <MobileWatchVideoNavigation id={id} thread={sortedThread} commentDisp={commentDisp} handleChangeCommentDisp={handleChangeCommentDisp} commentIndex={commentIndex} timeStamp={timeStamp} handleFullscreen={handleFullscreen} />
    </WatchVideoMainContainer>
  )
});