import { getBlob, ref } from "firebase/storage";
import { useEffect, useState, useRef } from "react";

import { firestorage } from "../libs/InitFirebase";

/**
 * Firebase Storageのデータを管理するHOOK
 * クライアント側はダウンロードのみ
 */
export function useFireStorage(
  path,
  initialState
) {
  const [data, setData] = useState(initialState);
  const initialStateRef = useRef(initialState);

  // initialStateの最新値を保持
  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  useEffect(() => {
    if (!path || path === "") {
      setData(initialStateRef.current);
      return;
    }
    
    // pathが変更されたときは、まずinitialStateにリセット
    setData(initialStateRef.current);
    
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
            if (!isCancelled) {
              setData(initialStateRef.current);
            }
          }
        };
        reader.onerror = () => {
          if (isCancelled) return;
          console.error('FileReader error while reading blob');
          setData(initialStateRef.current);
        };
        reader.readAsText(blob);
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to fetch data from Firebase Storage:', error);
        setData(initialStateRef.current);
      }
    };
    
    getData();
    
    return () => {
      isCancelled = true;
    };
  }, [path]);

  return data;
}