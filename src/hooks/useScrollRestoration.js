import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_KEY = "KoyoKoyoScrollPositions";
const MAX_ENTRIES = 50;

// 初回に開いたページの履歴エントリには key が付かず、React Router は "default" として扱う
const currentHistoryKey = () => window.history.state?.key ?? "default";

function readPositions() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePosition(key, y) {
  const positions = readPositions();
  // 新しく保存したものを末尾に置き、古いものから捨てる
  delete positions[key];
  positions[key] = y;
  const keys = Object.keys(positions);
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) {
    delete positions[old];
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // 保存できなくても一覧の表示には影響しない
  }
}

/**
 * 一覧ページのスクロール位置を履歴エントリごとに覚え、ブラウザの戻る・進むで復元するHOOK
 * 一覧のデータは毎回非同期で読み込むため、ブラウザ標準の復元は効かない。
 * データの読み込み後に描画されるコンポーネントで呼ぶ。
 * @param {string} resetKey 戻る・進む以外の遷移でこの値が変わったら先頭までスクロールする
 */
export function useScrollRestoration(resetKey) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.key;
  // 初回エントリの key は常に "default" なので、同じタブで別の URL を開き直したときに
  // 他のページの位置へ飛ばないよう、URL も保存キーに含める
  const storageKey = `${key}|${location.pathname}${location.search}`;
  const prevResetKey = useRef(null);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // スクロールのたびに位置を保存する
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // 遷移した直後は、次の画面の高さで縮んだ位置を前の画面の位置として保存しない
        if (currentHistoryKey() !== key) return;
        savePosition(storageKey, window.scrollY);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, [key, storageKey]);

  // 戻る・進むでは保存した位置へ、それ以外は必要なときだけ先頭へスクロールする
  useEffect(() => {
    const shouldReset = prevResetKey.current !== resetKey;
    prevResetKey.current = resetKey;

    const saved = navigationType === "POP" ? readPositions()[storageKey] : undefined;
    if (saved !== undefined) {
      // 子コンポーネントの初期化（ページ番号の反映など）で描画が落ち着くのを待つ
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => window.scrollTo(0, saved));
      });
      return () => cancelAnimationFrame(frame);
    }
    if (shouldReset) {
      window.scrollTo(0, 0);
    }
  }, [storageKey, resetKey, navigationType]);
}
