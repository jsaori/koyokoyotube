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
    const getData = async () => {
      await getBlob(ref(firestorage, path))
        .then((blob) => {
          const reader = new FileReader();
          reader.readAsText(blob);
          reader.onload = () => {
            setData(JSON.parse(reader.result));
          }
        })
        .catch((error) => {
          setData(initialState);
        });
    };
    getData();
  }, [path, initialState, isJosh]);

  return data;
}