import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import { Layout } from "../components/Layout/Layout";
import { Box, CircularProgress } from "@mui/material";

// コード分割: ページコンポーネントを遅延読み込み
const ChannelPage = lazy(() => import("./ChannelPage"));
const WatchPage = lazy(() => import("./WatchPage"));
const NotFoundPage = lazy(() => import("./NotFoundPage"));
const JoshPage = lazy(() => import("./JoshPage"));

// ローディングコンポーネント
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CircularProgress />
  </Box>
);

/**
 * コンポーネントメイン部
 * ルーティングの設定を行う
 * レスポンシブ対応により、モバイル/デスクトップで単一のコンポーネントを使用
 */
function App() {

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
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
            <Route path="channel/:chname/playlist" element={<ChannelPage subpage={0} />} />
            <Route path="channel/:chname/video" element={<ChannelPage subpage={1} />} />
            <Route path="channel/:chname/j" element={<ChannelPage subpage={99} />} />
            <Route path="channel/:chname/playlist/:listid" element={<ChannelPage subpage={0} />} />
            <Route path="watch/:videoid" element={<WatchPage />} />
            <Route path="josh" element={<JoshPage />} />
            <Route path="notfound" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
