import { useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box } from "@mui/material";

import { WatchVideoHeader } from "../components/WatchVideoContents/WatchVideoHeader";
import { WatchVideoMain } from "../components/WatchVideoContents/WatchVideoMain";
import { useGetYoutubeTitle } from "../hooks/useYoutubeInfo";

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
  const [title] = useGetYoutubeTitle(videoid);

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
