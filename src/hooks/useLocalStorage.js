import { useCallback, useState } from 'react';

/**
 * ブラウザ(Web Storage)にjson形式でデータを保存するHOOK
 * あまり推奨されないらしい
 * JOSH認証とライト/ダークモードの保存に使用
 * @param {string} key - localStorageのキー
 * @param {*} initialValue - 初期値
 * @returns {[*, Function, Function]} [state, set, remove]
 */
export const useLocalStorage = (key, initialValue) => {
  if (!key) {
    throw new Error('useLocalStorage key may not be falsy');
  }

  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const localStorageValue = localStorage.getItem(key);
      if (localStorageValue !== null) {
        return JSON.parse(localStorageValue);
      } else {
        if (initialValue !== undefined && initialValue !== null) {
          localStorage.setItem(key, JSON.stringify(initialValue));
        }
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const set = useCallback(
    (newValue) => {
      try {
        const valueToStore = JSON.stringify(newValue);
        localStorage.setItem(key, valueToStore);
        setState(newValue);
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [state, set, remove];
};
