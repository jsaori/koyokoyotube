import { useCallback, useState, useRef, useEffect } from 'react';

/**
 * ブラウザ(Web Storage)にjson形式でデータを保存するHOOK
 * あまり推奨されないらしい
 * JOSH認証とライト/ダークモードの保存に使用
 */
export const useLocalStorage = (key, initialValue) => {
  if (!key) {
    throw new Error('useLocalStorage key may not be falsy');
  }

  const initializer = useRef((key) => {
    const localStorageValue = localStorage.getItem(key);
    if (localStorageValue !== null) {
      return JSON.parse(localStorageValue);
    } else {
      initialValue && localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    }
  });

  const [state, setState] = useState(() =>
    typeof window === 'undefined' ? initialValue : initializer.current(key),
  );

  useEffect(() => setState(initializer.current(key)), [key]);

  const set = useCallback(
    (state) => {
      const value = JSON.stringify(state);
      localStorage.setItem(key, value);
      setState(JSON.parse(value));
    },
    [key],
  );

  const remove = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return [state, set, remove];
};
