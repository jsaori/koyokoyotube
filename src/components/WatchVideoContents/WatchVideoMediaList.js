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
import { useFirestoreMedia } from "../../hooks/useFirestoreMedia";
import { MediaReportDialog } from "./MediaReportDialog";

/**
 * 画像一覧表示のロジックを管理するカスタムフック
 */
export const useMediaList = (media, id, onImageClick) => {
  const mediaScrollContainerRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
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
  }, [id]);

  // 有効な画像のみをフィルタリング（読み込み失敗した画像は除外、重複URLはすべて除外）
  const validMedia = useMemo(() => {
    if (!media || media.length === 0) return [];
    
    // まず、各URLの出現回数をカウント
    const urlCount = new Map();
    media.forEach(item => {
      if (item?.src && item.src.trim() !== '') {
        urlCount.set(item.src, (urlCount.get(item.src) || 0) + 1);
      }
    });
    
    // 重複しているURL（2回以上出現）を特定
    const duplicateUrls = new Set();
    urlCount.forEach((count, url) => {
      if (count > 1) {
        duplicateUrls.add(url);
      }
    });
    
    return media.filter(item => {
      // srcが存在し、空文字列でないことを確認
      if (!item?.src || item.src.trim() === '') return false;
      // 読み込みに失敗した画像は除外
      if (failedImages.has(item.src)) return false;
      // 重複URL（2回以上出現）はすべて除外
      if (duplicateUrls.has(item.src)) return false;
      // imgur.comの「no longer available」エラー画像は読み込み時に除外されるため、ここでは除外しない
      return true;
    });
  }, [media, failedImages]);

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
  // Firestoreから画像を取得
  const { media: firestoreMedia } = useFirestoreMedia(id);
  
  // 報告ダイアログの状態管理
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [hiddenMediaIds, setHiddenMediaIds] = useState(new Set());
  
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
  } = useMediaList(firestoreMedia, id, onImageClick);

  // 動画が変わったら非表示リストをリセット
  useEffect(() => {
    setHiddenMediaIds(new Set());
  }, [id]);

  // 非表示指定されたメディアを除外
  const visibleMedia = useMemo(() => {
    if (!validMedia) return [];
    return validMedia.filter(media => !hiddenMediaIds.has(media.id));
  }, [validMedia, hiddenMediaIds]);

  // 右クリックで報告ダイアログを開く
  const handleContextMenu = useCallback((e, media) => {
    e.preventDefault();
    setReportTarget({
      videoId: id,
      mediaId: media.id,
      imageSrc: media.src,
    });
    setReportDialogOpen(true);
  }, [id]);

  const handleDialogClose = useCallback(() => {
    setReportDialogOpen(false);
    setReportTarget(null);
  }, []);

  const handleHideMedia = useCallback((mediaId) => {
    if (!mediaId) return;
    setHiddenMediaIds(prev => {
      const next = new Set(prev);
      next.add(mediaId);
      return next;
    });
  }, []);

  if (isMobile) return null;

  return (
    <>
      {visibleMedia.length > 0 && (
        <>
          <WatchVideoMediaScrollContainer ref={mediaScrollContainerRef}>
            {visibleMedia.map((media, index) => {
              // 読み込み成功した画像のみ表示
              if (loadedImages.has(media.src)) {
                const posMs = Number(media.posMs) || 0;
                const timeString = format(posMs - (60*60*9 * 1000), "HH:mm:ss");
                return (
                  <Tooltip key={`${media.src}-${index}`} title={timeString} placement="top" arrow>
                    <WatchVideoMediaItem data-posms={media.posMs}>
                      <img
                        src={media.src}
                        alt={`Media at ${media.posMs}ms`}
                        onError={() => handleImageError(media.src)}
                        onClick={() => onImageClick(media)}
                        onContextMenu={(e) => handleContextMenu(e, media)}
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
      <MediaReportDialog
        open={reportDialogOpen}
        onClose={handleDialogClose}
        videoId={reportTarget?.videoId}
        mediaId={reportTarget?.mediaId}
        imageSrc={reportTarget?.imageSrc}
        onHide={handleHideMedia}
      />
    </>
  );
};

