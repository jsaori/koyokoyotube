import { useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box } from "@mui/material";

import { MobileWatchVideoMain } from "../components/WatchVideoContents/MobileWatchVideoMain";

const WatchPageFullWidth = styled(Box)({
  maxWidth: window.screen.width,
  margin: 0,
});

const WatchPageContainer = styled(Box)({
  marginLeft: 0,
  marginRight: 0,
});

/**
 * モバイル用プレイリストページ
 */
export default function MobileWatchPage() {
  // 動画IDの取得
  const videoid = useParams().videoid;

  return (
    <WatchPageFullWidth>
      <WatchPageContainer>
        {/**
         * メインコンテンツ
         */}
        <MobileWatchVideoMain
          id={videoid}
        />
      </WatchPageContainer>
    </WatchPageFullWidth>
  )
}
