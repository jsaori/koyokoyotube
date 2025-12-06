import { getBlob, ref } from "firebase/storage";
import { useEffect, useState } from "react";

import { firestorage } from "../libs/InitFirebase";
import { useLocalStorage } from "./useLocalStorage";

/**
 * Firebase Storageのデータを管理するHOOK
 * クライアント側はダウンロードのみ
 */
export function useFireStorage(
  path,
  initialState
) {
  const [data, setData] = useState(initialState);
  const [isJosh] = useLocalStorage('josh', 'false');

  useEffect(() => {
    if (!path || path === "") return;
    // Josh認証が通らなければthread.gzはダウンロードしない
    if (path.match(/thread.gz/) && isJosh === 'false') return;
    
    let isCancelled = false;
    
    const getData = async () => {
      try {
        const blob = await getBlob(ref(firestorage, path));
        if (isCancelled) return;
        
        const reader = new FileReader();
        reader.onload = () => {
          if (isCancelled) return;
          try {
            const parsedData = JSON.parse(reader.result);
            setData(parsedData);
          } catch (parseError) {
            console.error('Failed to parse JSON from Firebase Storage:', parseError);
            setData(initialState);
          }
        };
        reader.onerror = () => {
          if (isCancelled) return;
          console.error('FileReader error while reading blob');
          setData(initialState);
        };
        reader.readAsText(blob);
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to fetch data from Firebase Storage:', error);
        setData(initialState);
      }
    };
    
    getData();
    
    return () => {
      isCancelled = true;
    };
  }, [path, isJosh]);

  return data;
}