import { useCallback, useEffect, useState } from "react";

import { equalTo, get, off, onValue, orderByChild, query, ref, update } from "firebase/database";

import { realtimedb } from "../libs/InitFirebase";

/**
 * Realtime Databaseのデータ取得を管理するHOOK
 * @param {*} initialState - 初期状態
 * @returns {[*, Function, Function]} [data, getData, resetData]
 */
export function useGetRealtimeDB(initialState) {
  const [data, setData] = useState(initialState);

  // get
  const getData = useCallback(async (path, initData = "") => {
    try {
      const dataRef = ref(realtimedb, path);
      const snapshot = await get(dataRef);
      const json = snapshot.val();
      setData(json || initData);
    } catch (error) {
      console.error('Failed to get data from Realtime Database:', error);
      setData(initData);
    }
  }, []);

  // reset
  const resetData = useCallback((initData) => {
    setData(initData);
  }, []);

  return [data, getData, resetData];
}

/**
 * Realtime Databaseの値イベントリッスンを管理するHOOK
 * @param {*} initialState - 初期状態
 * @param {string} path - データベースパス
 * @param {string} filterKey - フィルターキー
 * @param {*} filterValue - フィルター値
 * @returns {[*]} [data]
 */
export function useRealtimeDBListener(
  initialState,
  path,
  filterKey,
  filterValue
) {
  const [data, setData] = useState(initialState);

  // listener
  useEffect(() => {
    if (!path || !filterKey || filterValue === undefined) return;
    
    const dataRef = query(ref(realtimedb, path), orderByChild(filterKey), equalTo(filterValue));
    const handleValue = (snapshot) => {
      const val = snapshot.val();
      setData(val || initialState);
    };
    
    onValue(dataRef, handleValue);
    
    // クリーンアップ関数
    return () => {
      off(dataRef, 'value', handleValue);
    };
  }, [path, filterKey, filterValue, initialState]);

  return [data];
}

/**
 * Realtime Databaseのデータ更新を管理するHOOK
 * @returns {[boolean, Function]} [updating, updateData]
 */
export function useUpdateRealtimeDB() {
  const [updating, setUpdating] = useState(false);

  // update
  const updateData = useCallback(async (path, json) => {
    setUpdating(true);
    try {
      await update(ref(realtimedb, path), json);
    } catch (error) {
      console.error('Failed to update Realtime Database:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, []);

  return [updating, updateData];
}