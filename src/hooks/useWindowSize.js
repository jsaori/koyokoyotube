import { useState, useEffect } from 'react';

/**
 * ウィンドウサイズを管理するカスタムフック
 * SSR対応とリサイズ時の更新に対応
 * @returns {{width: number, height: number}} ウィンドウの幅と高さ
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // SSR環境では実行しない
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 初回設定
    handleResize();

    // リサイズイベントリスナーを追加
    window.addEventListener('resize', handleResize);

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
