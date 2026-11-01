import { memo } from "react";

import { Box, List } from "@mui/material";
import { VideoListSideContainerItem } from "./VideoListSideContainerItem";
/**
 * サイドバーリスト
 * 動画用
 */
export const VideoListSideContainer = memo(({ sx }) => {
  return (
    <Box {...sx}>
      <List disablePadding>
        <VideoListSideContainerItem text="動画一覧"/>
      </List>
    </Box>
  )
});