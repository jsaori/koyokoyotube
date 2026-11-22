import { memo, useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Box, Breadcrumbs, Link } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { usePlayingVideo } from "../../hooks/usePlayingVideo";
import { CHANNEL_NAMES } from "../../libs/constants";
import { buildWatchBreadcrumbs } from "../../libs/watchBreadcrumbs.mjs";

/**
 * 視聴画面の上部に出す、一覧へ戻るリンク（レスポンシブ対応）
 * デスクトップはパンくず、モバイルは直近の一覧へのリンク1つ
 */
export const WatchVideoBreadcrumbs = memo(({ isMobile }) => {
  const location = useLocation();
  const { channel, playlistId, playlistTitle, sort, isRandom } = usePlayingVideo();

  const items = useMemo(() => buildWatchBreadcrumbs({
    channel, knownChannels: CHANNEL_NAMES, playlistId, playlistTitle, sort, isRandom, from: location.state?.from,
  }), [channel, playlistId, playlistTitle, sort, isRandom, location.state?.from]);

  if (isMobile) {
    const last = items[items.length - 1];
    return (
      <Box sx={{ py: 1 }}>
        <Link
          component={RouterLink}
          to={last.to}
          underline="hover"
          color="text.secondary"
          sx={{ display: "inline-flex", alignItems: "center", fontSize: 13, maxWidth: "100%" }}
        >
          <ChevronLeftIcon fontSize="small" sx={{ flexShrink: 0 }} />
          <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {last.label}
          </Box>
        </Link>
      </Box>
    );
  }

  return (
    <Breadcrumbs aria-label="パンくずリスト" sx={{ mt: 2, fontSize: 13 }}>
      {items.map((item) => (
        <Link
          key={item.to}
          component={RouterLink}
          to={item.to}
          underline="hover"
          color="text.secondary"
          fontSize={13}
        >
          {item.label}
        </Link>
      ))}
    </Breadcrumbs>
  );
});
