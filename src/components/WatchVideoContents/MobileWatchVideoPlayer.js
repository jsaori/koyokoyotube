import { memo, useCallback, useEffect, useRef, useState } from "react";

import { Box } from "@mui/material";
import styled from "@emotion/styled";
import useMeasure from "react-use-measure";
import Konva from "konva";
import { Layer, Stage, Text } from "react-konva";
import { useLocation } from "react-router-dom";
import { FullScreen } from "react-full-screen";

import { YoutubePlayer } from "../YoutubePlayer/YoutubePlayer";
import { useYoutubePlayer } from "../../hooks/useYoutubePlayer";
import { useStreamComments } from "../../hooks/useStreamComments";
import { usePlayingVideo } from "../../hooks/usePlayingVideo";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainPlayerContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  backgroundColor: "black",
  display: "flex",
  flexDirection: "column"
}));

const WatchVideoMainPlayer = styled(Box)(({ theme }) => ({
  backgroundColor: "black",
  aspectRatio: "640/360",
  overflow: "hidden",
  position: "relative",
}));

const WatchVideoMainPlayerLayer = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
}));
//#endregion

// コメントコンポーネント
const DURATION_SECONDS = 5;
const CommentText = (props) => {
  const commentRef = useRef(null);
  const tweenRef = useRef(null);
  useEffect(() => {
    tweenRef.current = new Konva.Tween({
      node: commentRef.current,
      x: -commentRef.current.textWidth,
      duration: DURATION_SECONDS,
      onFinish: () => {
        if (commentRef.current) commentRef.current.destroy();
      }
    });
  }, [commentRef]);

  useEffect(() => {
    if (tweenRef === null) return;
    props.isPlaying ? tweenRef.current.play() : tweenRef.current.pause();
  }, [props.isPlaying, tweenRef]);

  return (
    <Text
      ref={commentRef}
      text={props.text}
      x={props.x}
      y={props.y}
      fontSize={props.fontSize}
      fontStyle={props.fontStyle}
      fill="white"
      stroke="black"
      strokeWidth={0.5}
      lineHeight={props.line === 1 ? 1 : 1.35}
      visible={props.visible}
    />
  )
}

/**
 * 動画の再生および流れるコメントの表示を行う
 */
export const MobileWatchVideoPlayer = memo(({ sx, id, thread, commentDisp, handleCommentIndex, handleFullscreen }) => {
  // Youtubeプレイヤーロード
  const { playerInstance, ...ytPlayerProps } = useYoutubePlayer({
    mountId: 'youtubeplayer',
    controls: true,
    autoplay: false,
    width: '100%',
    height: '100%'
  });

  const state = useLocation().state;
  useEffect(() => {
    if (!playerInstance || !state) return;
    playerInstance.seekTo(state.jumpTime);
  }, [playerInstance, state]);

  // ※動画が変遷する度にonStateChangeの実行回数が増えていくことに気付く※
  // Youtube Iframe APIのイベントリスナーはaddはできてもremoveできないバグがある
  // addしたonStateChange内で最新の関数を呼べば良いので以下の小細工を行う
  // イベントリスナーが増えていくことに対するパフォーマンスは考慮できていない
  const { navigateNextVideo } = usePlayingVideo();
  const navigateNextVideoRef = useRef();
  navigateNextVideoRef.current = navigateNextVideo;

  // Youtubeプレイヤー状態変化コールバック
  const [isPlaying, setPlaying] = useState(false);
  const onStateChange = useCallback((event) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      // 終了
      setPlaying(false);
      navigateNextVideoRef.current();
    } else if (event.data === window.YT.PlayerState.PLAYING) {
      // 再生中
      setPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      // 停止
      setPlaying(false);
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      // バッファリング中
    } else if (event.data === window.YT.PlayerState.CUED) {
      // 頭出し済み
    } else {
      // 未開始
    }
  }, []);

  // Youtubeプレイヤーイベントリスナー
  useEffect(() => {
    if (!playerInstance) return;
    playerInstance.addEventListener('onStateChange', onStateChange);
    return () => {
      playerInstance.removeEventListener('onStateChange', onStateChange);
    }
  }, [playerInstance, onStateChange]);

  // Youtubeプレイヤーロード完了時処理
  useEffect(() => {
    // プレイヤーロード後に指定動画をロード
    if (playerInstance) {
      const param = {
        videoId: id
      };
      playerInstance.loadVideoById(param);
    }
  }, [playerInstance, id]);

  // Youtube動画再生時間管理
  // currentMSに現在の再生時間(ms)を格納
  const [currentMS, setCurrentMS] = useState(0);
  const reqIdRef = useRef();
  useEffect(() => {
    const step = () => {
      if (!playerInstance) return;
      // 再生時間をYouTubeのAPIより取得 s->ms変換
      setCurrentMS(Math.floor(playerInstance.getCurrentTime() * 1000));
      reqIdRef.current = requestAnimationFrame(step);
    };
    step();
    return () => {
      reqIdRef.current && cancelAnimationFrame(reqIdRef.current);
    }
  }, [id, playerInstance]);

  // 動画上流れるコメント
  const {commentNo, comments, setStreamComments, resetStreamComments} = useStreamComments(thread);

  // コメントリセット処理
  // 動画変更時に前のコメントが残る問題に対処
  useEffect(() => {
    resetStreamComments();
  }, [id, resetStreamComments]);

  // コメント生成処理
  useEffect(() => {
    // 再生時間から流すべきコメントを生成
    setStreamComments(currentMS);
    // 現在の最新のコメントNoを設定
    handleCommentIndex(commentNo);
  }, [currentMS, commentNo, handleCommentIndex, setStreamComments]);

  // React-Konvaによるcanvas描画はpixel指定しかできないため可変ウィンドウ対応が必要
  // useMeasureのrefを親要素に指定することでboundsに親のwidth/heightがpixelで入る
  const [ref, bounds] = useMeasure();

  return (
    <WatchVideoMainPlayerContainer>
      {/**
       * プレイヤー部分
       */}
      <FullScreen
        handle={handleFullscreen}
      >
        <WatchVideoMainPlayer>
          {/**
           * コメントレンダラ
           */}
          <WatchVideoMainPlayerLayer
            zIndex={2}
            ref={ref}
            sx={{
              pointerEvents: "none"
            }}
          >
            <Stage
              width={bounds.width}
              height={bounds.height}
            >
              <Layer>
                {/**
                 * fontSize = 表示高さ / 15
                 * y = 表示高さ / 11 * 0 + 10
                 * くらいが丁度良い
                 */}
                {comments.map((comment, i) => (
                  <CommentText
                    key={comment.id}
                    text={comment.text}
                    x={bounds.width}
                    y={bounds.height / 11 * (comment.lane) + 10}
                    fontSize={bounds.height / 15}
                    fontStyle="700"
                    isPlaying={isPlaying}
                    line={comment.line}
                    visible={commentDisp}
                  />
                ))}
              </Layer>
            </Stage>
          </WatchVideoMainPlayerLayer>
          {/**
           * ビデオレンダラ
           */}
          <WatchVideoMainPlayerLayer
            zIndex={1}
          >
            <YoutubePlayer {...ytPlayerProps} hidden={!playerInstance} />
          </WatchVideoMainPlayerLayer>
        </WatchVideoMainPlayer>
      </FullScreen>
    </WatchVideoMainPlayerContainer>
  )
});