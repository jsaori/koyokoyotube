import { useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box } from "@mui/material";

import { WatchVideoHeader } from "../components/WatchVideoContents/WatchVideoHeader";
import { WatchVideoMain } from "../components/WatchVideoContents/WatchVideoMain";
import { useEffect, useState, useCallback } from "react";
import { getVideoTitle } from "../libs/initYoutube";
import { useBreakpoint } from "../hooks/useBreakpoint";

const WatchPageFullWidth = styled(Box)(({ theme }) => ({
  margin: '0 auto',
  [theme.breakpoints.up('md')]: {
    maxWidth: 1664,
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    width: '100%',
  },
}));

const WatchPageContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginLeft: 24,
    marginRight: 24,
  },
  [theme.breakpoints.down('md')]: {
    paddingLeft: 8,
    paddingRight: 8,
  },
}));

/**
 * 動画閲覧ページ（レスポンシブ対応）
 */
export default function WatchPage() {
  const { isMobile } = useBreakpoint();
  
  // 動画IDの取得
  const videoid = useParams().videoid;

  // 動画タイトルの取得
  // Youtubeのメタ情報から取得する
  const [title, setTitle] = useState("");
  
  const getTitle = useCallback(async () => {
    const res = await getVideoTitle(videoid);
    setTitle(res);
  }, [videoid]);

  useEffect(() => {
    getTitle();
  }, [getTitle]);

  return (
    <WatchPageFullWidth>
      <WatchPageContainer>
        {/**
         * ヘッダ（デスクトップのみ）
         */}
        {!isMobile && (
          <WatchVideoHeader
            title={title}
          />
        )}
        {/**
         * メインコンテンツ
         */}
        <WatchVideoMain
          id={videoid}
        />
      </WatchPageContainer>
    </WatchPageFullWidth>
  )
}
