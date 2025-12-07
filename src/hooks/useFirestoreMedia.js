import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
    // 注意: orderByは複合インデックスが必要なため、クライアント側でソート
    const mediaRef = collection(firestore, `videos/${videoId}/media`);
    const q = query(
      mediaRef,
      where("status", "==", "approved")
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
        // クライアント側でposMsの昇順にソート
        mediaData.sort((a, b) => {
          const posMsA = Number(a.posMs) || 0;
          const posMsB = Number(b.posMs) || 0;
          return posMsA - posMsB;
        });
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
