import { memo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box, IconButton, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from "@mui/material";
import { format, intervalToDuration } from "date-fns";
import ChatIcon from '@mui/icons-material/Chat';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { LazyLoadImage } from "react-lazy-load-image-component";

import { RegistThreadDialog } from "../RegistThread/RegistThreadDialog";

//#region ユーザー定義スタイルコンポーネント
const VideoListListItem = styled(ListItem)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    height: 72,
  },
  '&:hover, &.Mui-selected:hover': {
    "& .MuiListItemButton-root": {
      backgroundColor: theme.palette.control.main,
      "& .PublicPlayListItemText-head": {
        color: theme.palette.primary.dark,
      }
    }
  }
}));

const VideoListListItemButton = styled(ListItemButton)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    height: 72,
  },
  borderStyle: "none",
  padding: 0,
  gap: 16
}));

const VideoListMedia = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    height: 72,
  },
  flexGrow: 0,
  flexShrink: 0
}));

const VideoListMediaContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 192,
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    width: 128,
    height: 72,
  },
  display: "inline-block",
  overflow: "hidden",
  position: "relative",
  verticalAlign: "top"
}));

const VideoListMediaImage = styled(LazyLoadImage)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 192,
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    width: 128,
    height: 72,
  },
  margin: 0,
  padding: 0,
}));

const VideoListMediaText = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 4,
  right: 4,
  color: "#fff",
  fontSize: 12,
  padding: "2px 4px",
  pointerEvents: "none",
  textAlign: "center",
  backgroundColor: "rgba(0,0,0,.7)",
  borderRadius: 1,
  lineHeight: 1.4,
}));

const VideoListDiscription = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    height: 108,
  },
  [theme.breakpoints.down('md')]: {
    height: 72,
  },
  flex: '1 0 1px',
  minWidth: 0
}));

const ChatButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: 0,
  bottom: 0,
}));
//#endregion

export const VideoListItem = memo(({ sx, videoId, videoTitle, publishedAt, startTime, endTime, duration, comments, listId=null, sort }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ルーティング用
  const navigate = useNavigate();
  const chname = useParams().chname;

  // 動画コンテンツクリックイベント
  const handleClickVideo = () => {
    const playlistQuery = listId ? `?channel=${chname}&playlist=${listId}&sort=${sort}` : "";
    navigate(`/watch/${videoId}${playlistQuery}`);
  };

  // 公開日付文字列
  const publishDateString = startTime !== "" ? `${format(new Date(startTime), 'yyyy/MM/dd HH:mm')} 開始` : `${format(new Date(publishedAt), 'yyyy/MM/dd HH:mm')} 公開`;

  // コメントズレの可能性があれば表示
  const diffString = (startTime !== "" && Math.abs((new Date(endTime) - new Date(startTime)) /1000 - duration) > 30 ) ? `コメントズレ可能性有 : 配信時間 - 動画時間 = ${Math.floor((new Date(endTime) - new Date(startTime)) /1000 - duration)}秒` : "";

  // 動画時間文字列
  const videoDuration = intervalToDuration({ start: 0, end: duration * 1000 });
  const durationString = Object.keys(videoDuration).filter(key => key === 'minutes' || key === 'seconds' || videoDuration[key] !== 0).map((key) => {
    if (key === 'minutes' || key === 'seconds') {
      return ('00' + videoDuration[key]).slice(-2);
    } else {
      return videoDuration[key];
    }
  }).join(':');

  const [openDialog, setOpenDialog] = useState(false);
  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <VideoListListItem
      disablePadding
      sx={sx}
    >
      <VideoListListItemButton
        disableRipple
        onClick={handleClickVideo}
      >
        <VideoListMedia>
          <VideoListMediaContainer>
            <VideoListMediaImage
              component="img"
              alt=''
              src={`https://i.ytimg.com/vi_webp/${videoId}/mqdefault.webp`}
            />
            <VideoListMediaText>
              {durationString}
            </VideoListMediaText>
          </VideoListMediaContainer>
        </VideoListMedia>
        <VideoListDiscription>
          <ListItemText
            primary={videoTitle}
            className="PublicPlayListItemText-head"
            primaryTypographyProps={{
              style: {
                height: 'auto',
                lineHeight: !isMobile ? '20px' : '12px',
                overflow: 'hidden',
                wordBreak: 'break-all',
                fontSize: !isMobile ? '15px' : '10px'
              }
            }}
          />
          <ListItemText
            primary={publishDateString}
            className="PublicPlayListItemText-body"
            primaryTypographyProps={{
              style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: !isMobile ? '12px' : '8px',
                paddingTop: !isMobile ? '4px' : '1px'
              }
            }}
            secondary={diffString}
            secondaryTypographyProps={{
              style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: !isMobile ? '12px' : '8px',
                paddingTop: !isMobile ? '4px' : '1px'
              }
            }}
          />
        </VideoListDiscription>
      </VideoListListItemButton>
      <ChatButton
        onClick={handleClickOpen}
      >
        {comments ?
          <ChatIcon
            fontSize="small"
          /> :
          <AppRegistrationIcon
            fontSize="small"
            sx={{
              color: "primary.main"
            }}
          />
        }
      </ChatButton>
      <RegistThreadDialog
        open={openDialog}
        onClose={handleClose}
        youtubeid={videoId}
      />
    </VideoListListItem>
  )
});