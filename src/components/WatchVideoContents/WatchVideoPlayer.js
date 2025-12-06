import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Box, Dialog, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { format } from "date-fns";
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styled from "@emotion/styled";
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import useMeasure from "react-use-measure";
import Konva from "konva";
import { Layer, Stage, Text, Group } from "react-konva";
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

const WatchVideoMainPlayer = styled(Box)(({ theme, isFullscreen }) => ({
  backgroundColor: "black",
  ...(isFullscreen ? {
    width: "min(100vw, 100vh * 640 / 360)",
    height: "min(100vh, 100vw * 360 / 640)",
    aspectRatio: "640/360",
  } : {
    aspectRatio: "640/360",
  }),
  overflow: "hidden",
  position: "relative",
}));

const WatchVideoMainPlayerLayer = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
}));

const FullscreenExitButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  zIndex: 1000,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
}));

const WatchVideoMediaArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
}));

const WatchVideoMediaBox = styled(Box)(({ theme }) => ({
  background: theme.palette.control.light,
  height: 70,
  overflow: "hidden",
  position: "relative",
  width: "100%",
  borderRight: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 12px",
}));

const WatchVideoMediaScrollContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  overflowX: "auto",
  overflowY: "hidden",
  width: "100%",
  height: "100%",
  scrollBehavior: "smooth",
  gap: 8,
  "&::-webkit-scrollbar": {
    height: 4,
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.primary.main,
    borderRadius: 2,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: theme.palette.primary.dark,
  },
}));

const WatchVideoMediaItem = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  position: "relative",
  "& img": {
    height: "100%",
    width: "auto",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: 4,
    border: "1px solid",
    borderColor: theme.palette.control.dark,
    backgroundColor: theme.palette.control.main,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    },
  },
}));

const WatchVideoMediaArrowLeft = styled(WatchVideoMediaArrowButton)({
  left: 4,
});

const WatchVideoMediaArrowRight = styled(WatchVideoMediaArrowButton)({
  right: 4,
});
//#endregion

// コメントコンポーネント
const DURATION_SECONDS = 5;
const CommentText = ({ isMobile, ...props }) => {
  const groupRef = useRef(null);
  const tweenRef = useRef(null);
  const strokeWidth = isMobile ? 0.5 : 1;
  
  useEffect(() => {
    tweenRef.current = new Konva.Tween({
      node: groupRef.current,
      x: -groupRef.current.findOne('Text').textWidth,
      duration: DURATION_SECONDS,
      onFinish: () => {
        if (groupRef.current) groupRef.current.destroy();
      }
    });
  }, [groupRef]);

  useEffect(() => {
    if (tweenRef === null) return;
    props.isPlaying ? tweenRef.current.play() : tweenRef.current.pause();
  }, [props.isPlaying, tweenRef]);

  // アウトライン効果のためのオフセット（8方向）
  const outlineOffsets = [
    { x: -strokeWidth, y: -strokeWidth },
    { x: 0, y: -strokeWidth },
    { x: strokeWidth, y: -strokeWidth },
    { x: -strokeWidth, y: 0 },
    { x: strokeWidth, y: 0 },
    { x: -strokeWidth, y: strokeWidth },
    { x: 0, y: strokeWidth },
    { x: strokeWidth, y: strokeWidth }
  ];

  return (
    <Group
      ref={groupRef}
      x={props.x}
      y={props.y}
      visible={props.visible}
      opacity={props.opacity}
    >
      {/* アウトライン用の黒いテキスト（8方向に描画） */}
      {outlineOffsets.map((offset, index) => (
        <Text
          key={`outline-${index}`}
          text={props.text}
          x={offset.x}
          y={offset.y}
          fontSize={props.fontSize}
          fontStyle={props.fontStyle}
          fill="black"
          lineHeight={props.line === 1 ? 1 : 1.35}
        />
      ))}
      {/* メインのテキスト */}
      <Text
        text={props.text}
        x={0}
        y={0}
        fontSize={props.fontSize}
        fontStyle={props.fontStyle}
        fill={props.fill}
        lineHeight={props.line === 1 ? 1 : 1.35}
      />
    </Group>
  )
}

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

  // 画像一覧表示用の状態管理
  const mediaScrollContainerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [enlargedImageSrc, setEnlargedImageSrc] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(-1);
  const prevMediaIndexRef = useRef(-1);

  // 画像の読み込み失敗を記録（「no longer available」エラー画像も含む）
  const handleImageError = useCallback((src) => {
    setFailedImages(prev => new Set([...prev, src]));
    setLoadedImages(prev => {
      const next = new Set(prev);
      next.delete(src);
      return next;
    });
  }, []);

  // 画像の読み込み成功を記録
  const handleImageLoad = useCallback((src) => {
    setLoadedImages(prev => new Set([...prev, src]));
  }, []);

  // 動画変更時に画像の読み込み状態をリセット
  useEffect(() => {
    setLoadedImages(new Set());
    setFailedImages(new Set());
    setCurrentMediaIndex(-1);
    prevMediaIndexRef.current = -1;
  }, [id]);

  // 有効な画像のみをフィルタリング（読み込み失敗した画像は除外、重複URLはすべて除外）
  const validMedia = useMemo(() => {
    if (!thread?.data?.media) return [];
    
    // まず、各URLの出現回数をカウント
    const urlCount = new Map();
    thread.data.media.forEach(media => {
      if (media?.src && media.src.trim() !== '') {
        urlCount.set(media.src, (urlCount.get(media.src) || 0) + 1);
      }
    });
    
    // 重複しているURL（2回以上出現）を特定
    const duplicateUrls = new Set();
    urlCount.forEach((count, url) => {
      if (count > 1) {
        duplicateUrls.add(url);
      }
    });
    
    return thread.data.media.filter(media => {
      // srcが存在し、空文字列でないことを確認
      if (!media?.src || media.src.trim() === '') return false;
      // 読み込みに失敗した画像は除外
      if (failedImages.has(media.src)) return false;
      // 重複URL（2回以上出現）はすべて除外
      if (duplicateUrls.has(media.src)) return false;
      // imgur.comの「no longer available」エラー画像は読み込み時に除外されるため、ここでは除外しない
      return true;
    });
  }, [thread?.data?.media, failedImages]);

  // 現在の再生時刻に対応する画像インデックスを更新
  useEffect(() => {
    if (validMedia.length === 0) return;

    const adjustedMS = currentMS + (commentTimeOffset * 1000);
    
    // 読み込み成功した画像のみを対象とする
    const loadedMedia = validMedia.filter(media => loadedImages.has(media.src));
    if (loadedMedia.length === 0) return;
    
    // 現在の再生時刻に対応する画像を探す
    const newMediaIndex = loadedMedia.findIndex(media => {
      const mediaPosMs = Number(media.posMs) || 0;
      return mediaPosMs >= adjustedMS;
    });

    // 画像インデックスが変更された場合のみ更新
    if (newMediaIndex !== currentMediaIndex) {
      setCurrentMediaIndex(newMediaIndex);
    }
  }, [currentMS, validMedia, loadedImages, commentTimeOffset, currentMediaIndex]);

  // 自動スクロール機能（画像インデックスが変更されたときのみスクロール）
  useEffect(() => {
    if (!mediaScrollContainerRef.current || currentMediaIndex === -1) return;
    // 手動スクロール中は自動スクロールを無効化
    if (isManualScrollingRef.current) return;

    const container = mediaScrollContainerRef.current;
    
    // 読み込み成功した画像のみを対象とする
    const loadedMedia = validMedia.filter(media => loadedImages.has(media.src));
    if (loadedMedia.length === 0) return;

    // 画像インデックスが変更された場合のみスクロール
    if (currentMediaIndex !== prevMediaIndexRef.current) {
      const targetMedia = loadedMedia[currentMediaIndex];
      if (targetMedia) {
        const targetItem = container.querySelector(`[data-posms="${targetMedia.posMs}"]`);
        if (targetItem) {
          targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      } else {
        // 最後の画像より後ろの場合は最後の画像にスクロール
        const lastItem = container.querySelector(`[data-posms="${loadedMedia[loadedMedia.length - 1].posMs}"]`);
        if (lastItem) {
          lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
        }
      }
      prevMediaIndexRef.current = currentMediaIndex;
    }
  }, [currentMediaIndex, validMedia, loadedImages]);

  // スクロール位置を監視して矢印ボタンの表示を制御
  const checkScrollPosition = useCallback(() => {
    if (!mediaScrollContainerRef.current) return;
    const container = mediaScrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // スクロール位置の監視
  useEffect(() => {
    const container = mediaScrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener('scroll', checkScrollPosition);
    // リサイズ時もチェック
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, validMedia, loadedImages]);

  // 押下中のスクロール状態管理
  const scrollIntervalRef = useRef(null);
  const isManualScrollingRef = useRef(false);

  // 連続スクロール関数（MUIのTabsの実装を参考に）
  const startScrollingLeft = useCallback(() => {
    if (!mediaScrollContainerRef.current) return;
    isManualScrollingRef.current = true;
    const container = mediaScrollContainerRef.current;
    
    const scroll = () => {
      if (!container) return;
      const scrollAmount = container.clientWidth * 0.5; // コンテナ幅の50%ずつスクロール
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    };
    
    // 最初のスクロールを即座に実行
    scroll();
    
    // その後、一定間隔でスクロール
    scrollIntervalRef.current = setInterval(scroll, 300);
  }, []);

  const startScrollingRight = useCallback(() => {
    if (!mediaScrollContainerRef.current) return;
    isManualScrollingRef.current = true;
    const container = mediaScrollContainerRef.current;
    
    const scroll = () => {
      if (!container) return;
      const scrollAmount = container.clientWidth * 0.5; // コンテナ幅の50%ずつスクロール
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };
    
    // 最初のスクロールを即座に実行
    scroll();
    
    // その後、一定間隔でスクロール
    scrollIntervalRef.current = setInterval(scroll, 300);
  }, []);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    // 手動スクロール終了後、少し待ってから自動スクロールを再有効化
    setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 500);
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

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
          {validMedia.length > 0 && (
            <>
              <WatchVideoMediaScrollContainer ref={mediaScrollContainerRef}>
                {validMedia.map((media, index) => {
                // 読み込み成功した画像のみ表示
                if (loadedImages.has(media.src)) {
                  const posMs = Number(media.posMs) || 0;
                  const timeString = format(posMs - (60*60*9 * 1000), "HH:mm:ss");
                  const tooltipTitle = media.postedAt 
                    ? `${timeString}（${media.postedAt}）`
                    : timeString;
                  return (
                    <Tooltip title={tooltipTitle} placement="top" arrow>
                      <WatchVideoMediaItem key={`${media.src}-${index}`} data-posms={media.posMs}>
                        <img
                          src={media.src}
                          alt={`Media at ${media.posMs}ms`}
                          onError={() => handleImageError(media.src)}
                          onClick={() => setEnlargedImageSrc(media.src)}
                        />
                      </WatchVideoMediaItem>
                    </Tooltip>
                  );
                }
                // 読み込み中の画像は非表示で読み込みを試行
                return (
                  <img
                    key={`${media.src}-${index}-loading`}
                    src={media.src}
                    alt=""
                    onLoad={() => handleImageLoad(media.src)}
                    onError={() => handleImageError(media.src)}
                    style={{ display: 'none' }}
                  />
                );
              })}
              </WatchVideoMediaScrollContainer>
              {canScrollLeft && (
                <WatchVideoMediaArrowLeft
                  onMouseDown={startScrollingLeft}
                  onMouseUp={stopScrolling}
                  onMouseLeave={stopScrolling}
                  aria-label="左にスクロール"
                >
                  <ChevronLeftIcon />
                </WatchVideoMediaArrowLeft>
              )}
              {canScrollRight && (
                <WatchVideoMediaArrowRight
                  onMouseDown={startScrollingRight}
                  onMouseUp={stopScrolling}
                  onMouseLeave={stopScrolling}
                  aria-label="右にスクロール"
                >
                  <ChevronRightIcon />
                </WatchVideoMediaArrowRight>
              )}
            </>
          )}
        </WatchVideoMediaBox>
      )}
      {/**
       * 画像拡大表示Dialog
       */}
      <Dialog
        open={enlargedImageSrc !== null}
        onClose={() => setEnlargedImageSrc(null)}
        maxWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            boxShadow: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
            m: 2,
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
          }}
        >
          <IconButton
            onClick={() => setEnlargedImageSrc(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            aria-label="閉じる"
          >
            <CloseIcon />
          </IconButton>
          {enlargedImageSrc && (
            <img
              src={enlargedImageSrc}
              alt="拡大画像"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>
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
