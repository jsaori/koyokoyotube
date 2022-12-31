import { useCallback, useState } from "react";

import { get, ref, update } from "firebase/database";

import { realtimedb } from "../libs/InitFirebase";

/**
 * Realtime Databaseのデータ取得を管理するHOOK
 */
export function useGetRealtimeDB(
  initialState
) {
  const [data, setData] = useState(initialState);

  // get
  const getData = useCallback(async (path, initData = "") => {
    const dataRef = ref(realtimedb, path);
    const json = (await get(dataRef)).val();
    if (!json) {
      setData(initData);
    } else {
      setData(json);
    }
  }, []);

  // reset
  const resetData = useCallback((initData) => {
    setData(initData);
  }, []);

  return [data, getData, resetData];
}

/**
 * Realtime Databaseのデータ更新を管理するHOOK
 */
export function useUpdateRealtimeDB() {
  const [updating, setUpdating] = useState(false);

  // update
  const updateData = useCallback(async (path, json) => {
    setUpdating(true);
    await update(ref(realtimedb, path), json);
    setUpdating(false);
  }, []);

  return [updating, updateData];
}