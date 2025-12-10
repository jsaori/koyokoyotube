import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { firestore } from "../libs/InitFirebase";

/**
 * Firestoreから画像メディアを取得するカスタムフック
 * @param {string} videoId - YouTube動画ID
 * @returns {Array} 画像メディアの配列
 */
export const useFirestoreMedia = (videoId) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) {
      setMedia([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // videos/{videoId}/media コレクションから取得
    // 条件: status === 'approved'
    // ソート: posMsの昇順（サーバー側でソート）
    const mediaRef = collection(firestore, `videos/${videoId}/media`);
    const q = query(
      mediaRef,
      where("status", "==", "approved"),
      orderBy("posMs", "asc")
    );

    // リアルタイムリスナーを設定
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const mediaData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          mediaData.push({
            id: doc.id,
            src: data.src,
            posMs: data.posMs,
            postedAt: data.postedAt,
            ...data,
          });
        });
        // サーバー側でソート済みのため、クライアント側でのソートは不要
        setMedia(mediaData);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching media from Firestore:", err);
        setError(err);
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [videoId]);

  return { media, loading, error };
};
