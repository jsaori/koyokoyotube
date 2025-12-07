import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useMediaQuery, useTheme } from "@mui/material";
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import useMeasure from "react-use-measure";
import { Layer, Stage } from "react-konva";
import { useLocation } from "react-router-dom";
import { FullScreen } from "react-full-screen";

import { YoutubePlayer } from "../YoutubePlayer/YoutubePlayer";
import { useYoutubePlayer } from "../../hooks/useYoutubePlayer";
import { useStreamComments } from "../../hooks/useStreamComments";
import { usePlayingVideo } from "../../hooks/usePlayingVideo";
import {
  WatchVideoMainPlayerContainer,
  WatchVideoMainPlayer,
  WatchVideoMainPlayerLayer,
  FullscreenExitButton,
  WatchVideoMediaBox,
} from "./WatchVideoPlayer.styles";
import { CommentText } from "./CommentText";
import { useCommentCountGraph, CommentCountGraph } from "./CommentCountGraph";
import { WatchVideoMediaList } from "./WatchVideoMediaList";
import { EnlargedImageDialog } from "./EnlargedImageDialog";

// メディアリストの表示制御
// Firestoreから画像を取得して表示
const ENABLE_MEDIA_LIST = true;

/**
 * 動画の再生および流れるコメントの表示を行う（レスポンシブ対応）
 */
export const WatchVideoPlayer = memo(({ sx, id, thread, commentDisp, graphDisp, handleCommentIndex, handleFullscreen, commentColor = '#ffffff', commentAlpha = 1.0, commentSizeScale = 1.0, commentTimeOffset = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // フルスクリーン状態を検知
  const isFullscreen = handleFullscreen?.active || false;
  
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

  // 時間調整オフセット変更時にコメントをリセットして同期
  useEffect(() => {
    resetStreamComments();
  }, [commentTimeOffset, resetStreamComments]);

  // コメント生成処理
  useEffect(() => {
    // 再生時間から流すべきコメントを生成（時間調整オフセットを適用）
    // commentTimeOffsetは秒単位なので、ミリ秒に変換して加算
    const adjustedMS = currentMS + (commentTimeOffset * 1000);
    setStreamComments(adjustedMS);
    // 現在の最新のコメントNoを設定
    handleCommentIndex(commentNo);
  }, [currentMS, commentNo, handleCommentIndex, setStreamComments, commentTimeOffset]);

  // React-Konvaによるcanvas描画はpixel指定しかできないため可変ウィンドウ対応が必要
  // useMeasureのrefを親要素に指定することでboundsに親のwidth/heightがpixelで入る
  const [ref, bounds] = useMeasure();

  // コメント数グラフのデータを計算
  const commentsCount = useCommentCountGraph(thread, bounds, videoLength, isMobile, graphDisp);

  // 画像拡大表示用の状態管理
  const [enlargedImageMedia, setEnlargedImageMedia] = useState(null);

  // 画像クリック時のハンドラー（mediaオブジェクトを受け取る）
  const handleImageClick = useCallback((media) => {
    if (typeof media === 'string') {
      // 後方互換性: 文字列の場合はsrcとして扱う
      setEnlargedImageMedia({
        src: media,
        videoId: id,
        id: null,
      });
    } else {
      // mediaオブジェクトの場合
      setEnlargedImageMedia({
        ...media,
        videoId: id,
      });
    }
  }, [id]);

  return (
    <WatchVideoMainPlayerContainer>
      {/**
       * プレイヤー部分
       */}
      <FullScreen
        handle={handleFullscreen}
      >
        <WatchVideoMainPlayer isFullscreen={isFullscreen}>
          {/**
           * フルスクリーン解除ボタン（スマホのみ）
           */}
          {isFullscreen && isMobile && (
            <FullscreenExitButton
              onClick={handleFullscreen.exit}
              aria-label="フルスクリーンを終了"
            >
              <FullscreenExitIcon />
            </FullscreenExitButton>
          )}
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
                    fontSize={bounds.height / 15 * commentSizeScale}
                    fontStyle="700"
                    isPlaying={isPlaying}
                    line={comment.line}
                    visible={commentDisp}
                    isMobile={isMobile}
                    fill={commentColor}
                    opacity={commentAlpha}
                  />
                ))}
              </Layer>
            </Stage>
          </WatchVideoMainPlayerLayer>
          {/**
           * コメント数グラフ（デスクトップのみ）
           */}
          <CommentCountGraph
            bounds={bounds}
            commentsCount={commentsCount}
            isMobile={isMobile}
            graphDisp={graphDisp}
          />
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
       * 一時的に内容のみ非表示（ENABLE_MEDIA_LISTで制御）
       */}
      {!isMobile && (
        <WatchVideoMediaBox>
          {ENABLE_MEDIA_LIST && (
            <WatchVideoMediaList
              thread={thread}
              currentMS={currentMS}
              commentTimeOffset={commentTimeOffset}
              id={id}
              isMobile={isMobile}
              onImageClick={handleImageClick}
            />
          )}
        </WatchVideoMediaBox>
      )}
      {/**
       * 画像拡大表示Dialog
       */}
      <EnlargedImageDialog
        media={enlargedImageMedia}
        onClose={() => {
          setEnlargedImageMedia(null);
        }}
      />
    </WatchVideoMainPlayerContainer>
  )
}, (prevProps, nextProps) => {
  // graphDisp、commentAlpha、commentSizeScaleの変更を確実に検知する
  const shouldSkipRender = (
    prevProps.sx === nextProps.sx &&
    prevProps.id === nextProps.id &&
    prevProps.thread === nextProps.thread &&
    prevProps.commentDisp === nextProps.commentDisp &&
    prevProps.graphDisp === nextProps.graphDisp &&
    prevProps.handleCommentIndex === nextProps.handleCommentIndex &&
    prevProps.handleFullscreen === nextProps.handleFullscreen &&
    prevProps.commentColor === nextProps.commentColor &&
    prevProps.commentAlpha === nextProps.commentAlpha &&
    prevProps.commentSizeScale === nextProps.commentSizeScale &&
    prevProps.commentTimeOffset === nextProps.commentTimeOffset
  );
  
  return shouldSkipRender;
});
