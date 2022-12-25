import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box } from "@mui/material";
import axios from "axios";

import { WatchVideoHeader } from "../components/WatchVideoContents/WatchVideoHeader";
import { WatchVideoMain } from "../components/WatchVideoContents/WatchVideoMain";

const WatchPageFullWidth = styled(Box)({
  maxWidth: 1664,
  margin: '0 auto',
});

const WatchPageContainer = styled(Box)({
  marginLeft: 24,
  marginRight: 24,
});

/**
 * 動画閲覧ページ
 */
export default function WatchPage() {
  // 動画IDの取得
  const videoid = useParams().videoid;

  // 動画タイトルの取得
  // Youtubeのメタ情報から取得する
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (!videoid) return;
    const reqURL = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoid}&format=json`;
    axios.get(reqURL)
      .then((res) => setTitle(res.data.title));
  }, [videoid]);

  return (
    <WatchPageFullWidth>
      <WatchPageContainer>
        {/**
         * ヘッダ
         */}
        <WatchVideoHeader
          title={title}
        />
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
