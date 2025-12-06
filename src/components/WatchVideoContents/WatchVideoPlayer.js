import { memo, useCallback, useEffect, useRef, useState } from "react";

import { Box, useMediaQuery, useTheme } from "@mui/material";
import styled from "@emotion/styled";
import useMeasure from "react-use-measure";
import Konva from "konva";
import { Layer, Stage, Text } from "react-konva";
import { useLocation } from "react-router-dom";
import { FullScreen } from "react-full-screen";
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';

import { YoutubePlayer } from "../YoutubePlayer/YoutubePlayer";
import { useYoutubePlayer } from "../../hooks/useYoutubePlayer";
import { useStreamComments } from "../../hooks/useStreamComments";
import { usePlayingVideo } from "../../hooks/usePlayingVideo";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainPlayerContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "black",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up('md')]: {
    width: "calc(100% - 384px)",
    minWidth: 640,
  },
  [theme.breakpoints.down('md')]: {
    width: "100%",
  },
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

const WatchVideoMediaBox = styled(Box)(({ theme }) => ({
  background: theme.palette.control.light,
  height: 80,
  overflow: "hidden",
  position: "relative",
  width: "100%",
  borderRight: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  display: "flex",
  justifyContent: "space-between",
}));
//#endregion

// コメントコンポーネント
const DURATION_SECONDS = 5;
const CommentText = ({ isMobile, ...props }) => {
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
      strokeWidth={isMobile ? 0.5 : 1}
      lineHeight={props.line === 1 ? 1 : 1.35}
      visible={props.visible}
    />
  )
}

/**
 * 動画の再生および流れるコメントの表示を行う（レスポンシブ対応）
 */
export const WatchVideoPlayer = memo(({ sx, id, thread, commentDisp, graphDisp, handleCommentIndex, handleFullscreen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // コメント数グラフの計算のため動画の再生時間を取得（デスクトップのみ）
  const [videoLength, setVideoLength] = useState(0);

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
      // コメントグラフ用に動画の再生時間を取得（デスクトップのみ）
      if (!isMobile && graphDisp) {
        setVideoLength(event.target.getDuration());
      }
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
  }, [isMobile, graphDisp]);

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

  // コメントされた時間をインターバルで区切ってコメント数を算出する（デスクトップのみ、コメントグラフ表示時のみ）
  const SEEK_BAR_MARGIN = 12;
  const [commentsCount, setCommentsCount] = useState([]);
  useEffect(() => {
    if (!isMobile && graphDisp && thread && bounds && videoLength > 0) {
      // 動画再生時間を超えたコメントは切り捨てる
      const filteredComments = thread.data.comments.filter(c => c.posMs / 1000 <= videoLength);

      // インターバル数はシークバーの width に揃える
      const intervalCount = bounds.width - SEEK_BAR_MARGIN * 2;

      // インターバルは再生時間をインターバル数で分割する
      const interval = videoLength / intervalCount;

      // インターバルの配列を生成
      const intervals = Array.from({length: Math.ceil(videoLength / interval)}, (_, i) => i * interval);

      // インターバルごとにコメント数を算出する
      const commentsCount = intervals.map(intervalStart => {
        return {
          time: intervalStart,
          count: filteredComments.filter(c => c.posMs / 1000 >= intervalStart && c.posMs / 1000 < intervalStart + interval).length
        }
      });
      setCommentsCount(commentsCount);
    } else {
      setCommentsCount([]);
    }
  }, [thread, bounds, videoLength, isMobile, graphDisp]);

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
            zIndex={3}
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
                    isMobile={isMobile}
                  />
                ))}
              </Layer>
            </Stage>
          </WatchVideoMainPlayerLayer>
          <WatchVideoMainPlayerLayer
          zIndex={2}
          sx={{
            pointerEvents: "none"
          }}
          >
          {/**
           * コメント数グラフ（デスクトップのみ）
           */}
          {!isMobile && graphDisp &&
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  width={bounds.width - SEEK_BAR_MARGIN * 2}
                  height={bounds.height}
                  data={commentsCount}
                  margin={{top: bounds.height * 3 / 4, bottom: 45, left: SEEK_BAR_MARGIN, right: SEEK_BAR_MARGIN}}
                >
                  <XAxis dataKey="time" hide={true} />
                  <Area type="monotone" dataKey="count" stroke="#ffacd3" fill="#ffacd3" />
                </AreaChart>
            </ResponsiveContainer>}
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
      {/**
       * 何かに使うかもしれない枠（デスクトップのみ）
       * 絵師の画像一覧 or コメント投稿欄
       *
       */}
      {!isMobile && (
        <WatchVideoMediaBox>

        </WatchVideoMediaBox>
      )}
    </WatchVideoMainPlayerContainer>
  )
});
