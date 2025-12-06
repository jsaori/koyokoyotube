import { memo, useMemo, useState } from "react";

import styled from "@emotion/styled";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useFullScreenHandle } from "react-full-screen";

import { WatchVideoNavigation } from "./WatchVideoNavigation";
import { WatchVideoPlayer } from "./WatchVideoPlayer";
import { useFireStorage } from "../../hooks/useFireStorage";
import { getTimeStamp } from "../../libs/initYoutube";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainContainer = styled(Box)(({ theme }) => ({
  marginBottom: 16,
  position: "relative",
  display: "flex",
  [theme.breakpoints.up('md')]: {
    boxShadow: "0 1px 8px rgb(0 0 0 / 10%)",
    flexDirection: "row"
  },
  [theme.breakpoints.down('md')]: {
    flexDirection: "column"
  },
}));
//#endregion

/**
 * 動画関連メイン部（レスポンシブ対応）
 */
export const WatchVideoMain = memo(({ sx, id }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
  // コメントグラフ表示ボタン（デスクトップのみ）
  // デフォルトは非表示にしておく
  const [graphDisp, setGraphDisp] = useState(false);
  const handleChangeGraphDisp = () => {
    setGraphDisp(!graphDisp);
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
      <WatchVideoPlayer id={id} thread={sortedThread} commentDisp={commentDisp} graphDisp={!isMobile ? graphDisp : undefined} handleCommentIndex={handleCommentIndex} handleFullscreen={handleFullscreen} />
      {/**
       * ナビゲーションパネル
       */}
      <WatchVideoNavigation id={id} thread={sortedThread} commentDisp={commentDisp} handleChangeCommentDisp={handleChangeCommentDisp} graphDisp={!isMobile ? graphDisp : undefined} handleChangeGraphDisp={!isMobile ? handleChangeGraphDisp : undefined} commentIndex={commentIndex} timeStamp={timeStamp} handleFullscreen={handleFullscreen} />
    </WatchVideoMainContainer>
  )
});
