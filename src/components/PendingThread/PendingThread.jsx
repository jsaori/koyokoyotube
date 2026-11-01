import React, { memo, useEffect, useState, useRef } from "react";

import styled from "@emotion/styled";
import { Box, Card, CardContent, Link, Typography } from "@mui/material";

import { useRealtimeDBListener } from "../../hooks/useRealtimeDB";
import { getVideoTitle } from "../../libs/initYoutube";

//#region ユーザー定義スタイルコンポーネント
const JBox = styled(Box)((theme) => ({
  width: "100%",
}));

const PendingCard = styled(Card)(({ theme }) => ({
  marginBottom: '12px',
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)' 
    : 'rgba(0, 0, 0, 0.01)',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
}));

const ThreadUrlTypography = styled(Typography)({
  variant: "body2",
  fontSize: '0.875rem',
  color: 'text.secondary',
  marginTop: '8px',
  wordBreak: 'break-all',
});
//#endregion

/**
 * 実況スレ登録待ち確認
 */
export const PendingThread = memo(({ sx }) => {
  // 登録待ち情報取得
  const [pendingData] = useRealtimeDBListener({"": {threads: []}}, "/thread", "update", true);
  // タイトル
  const [titles, setTitles] = useState({});
  // 既にタイトル取得済みのキーを追跡（APIリクエストの重複を防ぐ）
  const fetchedKeysRef = useRef(new Set());
  
  useEffect(() => {
    const exec = async () => {
      let obj = {};
      // 新しく追加されたキー（タイトル未取得のキー）のみAPIリクエストを送る
      const keysToFetch = Object.keys(pendingData).filter(
        (key) => key !== "" && !fetchedKeysRef.current.has(key)
      );
      
      await Promise.all(keysToFetch.map(async (key) => {
        if (obj[key]) return;
        obj[key] = {};
        fetchedKeysRef.current.add(key); // 取得開始をマーク
        try {
          const title = await getVideoTitle(key);
          // getVideoTitleはエラー時に空文字列を返すため、空文字列の場合はエラーとして扱う
          obj[key].title = title || "タイトル取得失敗";
        } catch (error) {
          console.error(`Failed to get video title for ${key}:`, error);
          obj[key].title = "タイトル取得失敗";
        }
      }));
      
      // pendingDataに存在するキーのタイトルのみを保持する
      // 元のObject.assignの動作を維持しつつ、削除されたキーを除外
      setTitles((titles) => {
        const merged = Object.assign({}, obj, titles);
        const newTitles = {};
        const pendingKeys = new Set(Object.keys(pendingData).filter(key => key !== ""));
        
        // pendingDataに存在するキーのタイトルのみを保持
        pendingKeys.forEach((key) => {
          if (merged[key]) {
            newTitles[key] = merged[key];
          }
        });
        
        // pendingDataから削除されたキーは、fetchedKeysRefからも削除（メモリリーク防止）
        fetchedKeysRef.current.forEach((key) => {
          if (!pendingKeys.has(key)) {
            fetchedKeysRef.current.delete(key);
          }
        });
        
        return newTitles;
      });
    };
    exec();
  }, [pendingData]);

  return (
    <JBox
      sx={sx}
    >
      {Object.keys(pendingData).filter((key) => key !== "").map((key) => (
        <PendingCard key={key}>
          <CardContent>
            <Link 
              href={`https://www.youtube.com/watch?v=${key}`} 
              rel="noopener noreferrer" 
              target="_blank" 
              underline="hover"
              sx={{ 
                fontSize: '1rem',
                fontWeight: 500,
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.dark',
                }
              }}
            >
              {titles[key]?.title || 'タイトル取得中...'}
            </Link>
            {pendingData[key].threads.map((thread, i) => (
              <ThreadUrlTypography key={`${key}-${i}-${thread.url}`}>
                {thread.url}
              </ThreadUrlTypography>
            ))}
          </CardContent>
        </PendingCard>
      ))}
    </JBox>
  )
});