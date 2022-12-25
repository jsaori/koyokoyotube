import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { isMobile } from "react-device-detect";

import { Layout } from "../components/Layout/Layout";
import MobileChannelPage from "./MobileChannelPage";
import MobileWatchPage from "./MobileWatchPage";
import ChannelPage from "./ChannelPage";
import WatchPage from "./WatchPage";
import NotFoundPage from "./NotFoundPage";
import JoshPage from "./JoshPage";

/**
 * コンポーネントメイン部
 * ルーティングの設定を行う
 * モバイル用の画面構成は入り口から分ける
 */
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout />
          }
        >
          {/**
           * ルートへのアクセス時、博衣こよりのページに遷移
           * チャンネルへのアクセス時もついでに博衣こよりのページに遷移
           */}
          <Route index element={<Navigate to="channel/koyori/playlist" />} />
          <Route path="channel" element={<Navigate to="koyori/playlist" />} />
          <Route path="channel/:chname" element={<Navigate to="playlist" />} />
          <Route path="channel/:chname/playlist" element={!isMobile ? <ChannelPage subpage={0} /> : <MobileChannelPage subpage={0} />} />
          <Route path="channel/:chname/video" element={!isMobile ? <ChannelPage subpage={1} /> : <MobileChannelPage subpage={1} />} />
          <Route path="channel/:chname/playlist/:listid" element={!isMobile ? <ChannelPage subpage={0} /> : <MobileChannelPage subpage={0} />} />
          <Route path="watch/:videoid" element={!isMobile ? <WatchPage /> : <MobileWatchPage />} />
          <Route path="josh" element={<JoshPage />} />
          <Route path="notfound" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
