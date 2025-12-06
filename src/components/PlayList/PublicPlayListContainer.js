import { memo } from "react";

import { Box, List, useMediaQuery, useTheme } from "@mui/material";

import { PublicPlayListItem } from "./PublicPlayListItem";

/**
 * 特定再生リストのコンテンツ一覧
 */
export const PublicPlayListContainer = memo(({ sx, playlistData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box {...sx}>
      <List disablePadding>
        {playlistData.map((playlist, index) => (
          playlist.videos.length > 0 && (
            <PublicPlayListItem
              key={playlist.id}
              playlistId={playlist.id}
              playlistTitle={playlist.title}
              updateAt={playlist.updateAt}
              videoCount={playlist.videos.length}
              videos={playlist.videos.filter(v => v).slice(0, 3)}
              sx={{
                mt: (index === 0 || isMobile) ? 0 : 1,
                mb: (index !== playlistData.length - 1 || isMobile) ? 0 : 2
              }}
            />
          )
        ))}
      </List>
    </Box>
  )
});