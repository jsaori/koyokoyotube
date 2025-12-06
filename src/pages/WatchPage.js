import { useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box, useMediaQuery, useTheme } from "@mui/material";

import { WatchVideoHeader } from "../components/WatchVideoContents/WatchVideoHeader";
import { WatchVideoMain } from "../components/WatchVideoContents/WatchVideoMain";
import { useEffect, useState } from "react";
import { getVideoTitle } from "../libs/initYoutube";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 動画IDの取得
  const videoid = useParams().videoid;

  // 動画タイトルの取得
  // Youtubeのメタ情報から取得する
  const [title, setTitle] = useState("");
  useEffect(() => {
    const getTitle = async () => {
      const res = await getVideoTitle(videoid);
      setTitle(res);
    };
    getTitle();
  }, [videoid]);

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
