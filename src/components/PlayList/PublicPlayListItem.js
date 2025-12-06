import { memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styled from "@emotion/styled";
import { Box, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import { format } from "date-fns";
import { LazyLoadImage } from "react-lazy-load-image-component";

//#region ユーザー定義スタイルコンポーネント
const PublicPlayListListItem = styled(ListItem)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 112,
  },
  [theme.breakpoints.down('md')]: {
    height: 60,
  },
  '&:hover, &.Mui-selected:hover': {
    "& .MuiListItemButton-root": {
      backgroundColor: theme.palette.control.light,
      boxShadow: "0 0 2px #fe68ad",
      "& .PublicPlayListItemText-head": {
        color: theme.palette.primary.dark,
      }
    }
  }
}));

const PublicPlayListListItemButton = styled(ListItemButton)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 112,
  },
  [theme.breakpoints.down('md')]: {
    height: 60,
  },
  backgroundColor: theme.palette.control.light,
  border: "1px solid",
  borderColor: theme.palette.control.dark,
}));

const PublicPlayListDiscription = styled(Box)(({ theme }) => ({
  flex: '1 0 1px',
  [theme.breakpoints.up('md')]: {
    minWidth: 0,
    height: 78,
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '100%',
    height: 50,
  },
}));

const PublicPlayListMedia = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.control.main,
  border: "1px solid",
  borderColor: theme.palette.control.dark,
  borderRadius: 4,
  display: "flex",
  flexShrink: 0,
  height: 78,
  justifyContent: "flex-start",
  padding: "12px 30px 12px 12px",
  width: 346,
  flexGrow: 0,
  position: "relative"
}));


const PublicPlayListMediaBox = styled(LazyLoadImage)({
  borderRadius: 1,
  display: "inline-block",
  overflow: "hidden",
  position: "relative",
  verticalAlign: "top",
  height: 54,
  width: 96,
  objectFit: "cover"
});

const PublicPlayListMediaContainer = styled(Box)({
  height: 54,
  position: "relative",
  width: 96
});

const PublicPlayListMediaBeforeBox = styled(Box)(({ theme }) => ({
  '&::before': {
    content: '""',
    background: `linear-gradient(90deg,hsla(0,0%,98%,0),${theme.palette.paper.sub})`,
    display: "block",
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 1
  }
}));

const PublicPlayListMediaText = styled(Box)({
  bottom: 12,
  fontSize: 14,
  fontWeight: 500,
  position: "absolute",
  right: 12,
  zIndex: 1
});
//#endregion

export const PublicPlayListItem = memo(({ sx, playlistId, playlistTitle, updateAt, videoCount, videos }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ルーティング用
  const navigate = useNavigate();
  const location = useLocation();

  // ボタンクリックイベント
  const handleClickItem = () => {
    navigate(location.pathname + "/" + playlistId);
  };

  const updateDate = new Date(updateAt);

  return (
    <PublicPlayListListItem
      disablePadding
      sx={sx}
    >
      <PublicPlayListListItemButton
        disableRipple
        onClick={handleClickItem}
      >
        <PublicPlayListDiscription>
          <ListItemText
            primary={playlistTitle}
            className="PublicPlayListItemText-head"
            primaryTypographyProps={{
              style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '15px'
              }
            }}
          />
          <ListItemText
            primary={"最終更新日: " + format(updateDate, 'yyyy/MM/dd')}
            className="PublicPlayListItemText-body"
            primaryTypographyProps={{
              style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '12px'
              }
            }}
          />
        </PublicPlayListDiscription>
        {!isMobile && (
          <PublicPlayListMedia>
            {videos.map((video, index) => (
              <PublicPlayListMediaContainer
                key={index}
                marginLeft={index > 0 ? 1 : 0}
              >
                {index < 2 ? (
                  <PublicPlayListMediaBox
                    src={`https://i.ytimg.com/vi_webp/${video.id}/default.webp`}
                  />
                ) : (
                  <PublicPlayListMediaBeforeBox>
                    <PublicPlayListMediaBox
                      src={`https://i.ytimg.com/vi_webp/${video.id}/default.webp`}
                    />
                  </PublicPlayListMediaBeforeBox>
                )}
              </PublicPlayListMediaContainer>
            ))}
            <PublicPlayListMediaText>
              …{videoCount}件
            </PublicPlayListMediaText>
          </PublicPlayListMedia>
        )}
      </PublicPlayListListItemButton>
    </PublicPlayListListItem>
  )
});