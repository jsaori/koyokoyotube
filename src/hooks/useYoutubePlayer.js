import { useCallback, useEffect, useMemo, useState } from "react";

import iframeApi from "../libs/LoadIframeApi";

/**
 * Youtube動画プレイヤーを管理するHOOK
 */
export function useYoutubePlayer({mountId, width, height, autoplay, controls}) {
  const [playerReady, setPlayerReady] = useState(false);
  const [playerInstance, setPlayerInstance] = useState(null);

  const onPlayerReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  const setYoutubePlayer = useCallback((mountId) => {
    iframeApi().then((YT) => {
      setPlayerInstance(new YT.Player(
        mountId,
        {
          width: width,
          height: height,
          playerVars: {
            controls: controls ? 1 : 0,
            autoplay: autoplay ? 1 : 0,
            // 関連動画は再生中チャンネルのみ
            rel : 0,
            // 全画面表示ボタンを削除：レイヤー構成が面倒
            fs: 0,
          },
          events: {
            onReady: onPlayerReady,
          },
        }
      ));
    })
  }, [width, height, autoplay, controls, onPlayerReady]);

  const unmountYoutubePlayer = useCallback(() => {
    setPlayerReady(false);
    setPlayerInstance(null);
  }, []);

  useEffect(() => {
    setYoutubePlayer(mountId);

    return () => {
      unmountYoutubePlayer();
    }
  }, [mountId, setYoutubePlayer, unmountYoutubePlayer]);

  return useMemo(() => ({
    playerInstance : playerReady ? playerInstance : null,
    id: mountId,
  }), [playerInstance, mountId, playerReady]);
}
