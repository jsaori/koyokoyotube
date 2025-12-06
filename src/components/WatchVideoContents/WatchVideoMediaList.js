import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Tooltip } from "@mui/material";
import { format } from "date-fns";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  WatchVideoMediaScrollContainer,
  WatchVideoMediaItem,
  WatchVideoMediaArrowLeft,
  WatchVideoMediaArrowRight,
} from "./WatchVideoPlayer.styles";

/**
 * 画像一覧表示のロジックを管理するカスタムフック
 */
export const useMediaList = (thread, currentMS, commentTimeOffset, id, onImageClick) => {
  const mediaScrollContainerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(-1);
  const prevMediaIndexRef = useRef(-1);
  const scrollIntervalRef = useRef(null);
  const isManualScrollingRef = useRef(false);

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

  return {
    mediaScrollContainerRef,
    validMedia,
    loadedImages,
    handleImageError,
    handleImageLoad,
    canScrollLeft,
    canScrollRight,
    startScrollingLeft,
    startScrollingRight,
    stopScrolling,
  };
};

/**
 * 画像一覧表示コンポーネント（デスクトップのみ）
 */
export const WatchVideoMediaList = ({ 
  thread, 
  currentMS, 
  commentTimeOffset, 
  id, 
  isMobile,
  onImageClick 
}) => {
  const {
    mediaScrollContainerRef,
    validMedia,
    loadedImages,
    handleImageError,
    handleImageLoad,
    canScrollLeft,
    canScrollRight,
    startScrollingLeft,
    startScrollingRight,
    stopScrolling,
  } = useMediaList(thread, currentMS, commentTimeOffset, id, onImageClick);

  if (isMobile) return null;

  return (
    <>
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
                  <Tooltip key={`${media.src}-${index}`} title={tooltipTitle} placement="top" arrow>
                    <WatchVideoMediaItem data-posms={media.posMs}>
                      <img
                        src={media.src}
                        alt={`Media at ${media.posMs}ms`}
                        onError={() => handleImageError(media.src)}
                        onClick={() => onImageClick(media.src)}
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
    </>
  );
};

