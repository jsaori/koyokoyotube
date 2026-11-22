import { getBlob, ref } from "firebase/storage";
import { useEffect, useState, useRef } from "react";

import { firestorage } from "../libs/InitFirebase";

// 同じパスを同時に読み込むコンポーネントが複数あるとき、ダウンロードを1回にまとめる
// 読み込みが終わったら捨てるので、後から開いた画面は最新のデータを読み込み直す
const inflightTexts = new Map();

function fetchText(path) {
  let promise = inflightTexts.get(path);
  if (!promise) {
    promise = getBlob(ref(firestorage, path))
      .then((blob) => blob.text())
      .finally(() => inflightTexts.delete(path));
    inflightTexts.set(path, promise);
  }
  return promise;
}

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
        const text = await fetchText(path);
        if (isCancelled) return;

        // 受け取った側でデータを書き換えることがあるので、オブジェクトは共有せずに毎回パースする
        try {
          setData(JSON.parse(text));
        } catch (parseError) {
          console.error('Failed to parse JSON from Firebase Storage:', parseError);
          setData(initialStateRef.current);
        }
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