import { memo, useEffect, useRef, useState } from "react";

import styled from "@emotion/styled";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { format } from "date-fns";
import { Box, IconButton } from "@mui/material";
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import FlagIcon from '@mui/icons-material/Flag';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

import { useLocalStorage } from "../../hooks/useLocalStrage";
import { isMobile } from "react-device-detect";
import { VideoReportForm } from "../VideoReportForm/VideoReportForm";
import { RegistThreadDialog } from "../RegistThread/RegistThreadDialog";
import { Fullscreen, ShowChart } from "@mui/icons-material";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainPanelMenuContainer = styled(Box)(({ theme }) => ({
  borderBottom: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  height: 40,
  paddingLeft : 16,
  paddingRight: 8,
  display: "table",
  position: "relative",
  width: "100%"
}));

const WatchVideoMainPanelMenuContents = styled(Box)(({ theme }) => ({
  verticalAlign: "middle",
  boxSizing: "border-box",
  display: "table-cell",
  minWidth: 1,
  position: "relative",
}));

const WatchVideoCommentHeader = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  position: "relative"
}));

const WatchVideoCommentHeaderContents = styled(Box)(({ theme }) => ({
  display: "inline-block",
  height: 28,
  overflow: "hidden",
  textOverflow: "ellipsis",
  verticalAlign: "top",
  background: theme.palette.paper.dark,
  borderRight: "1px solid",
  borderColor: theme.palette.paper.contrastBorder,
  lineHeight: "28px",
  fontWeight: 700,
  paddingLeft: 8,
}));

const WatchVideoCommentMain = styled(Box)(({ theme }) => ({
  bottom: 0,
  fontSize: 13,
  left: 0,
  position: !isMobile ? "absolute" : "relative",
  right: 0,
  top: 40,
  display: "flex",
  flexDirection: "column",
  width: "100%"
}));

const WatchVideoCommentDisplay = styled(Box)(({ theme }) => ({
  overflowY: "hidden",
  overflowX: "hidden",
  height: !isMobile ? "100%" : window.screen.height - 500,
  width: 384,
}));

const WatchVideoCommentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
}));

const WatchVideoCommentBase = styled(Box)(({ theme }) => ({
  display: "inline-block",
  lineHeight: "28px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  borderRight: "1px solid #e5e8ea",
  borderColor:  theme.palette.paper.contrastBorder,
  padding: "0 8px",
}));

const CommentTypeSelect = styled("select")(({ theme }) => ({
  height: 24,
  width: 126,
  fontSize: 13,
  color: theme.palette.control.contrastText,
  backgroundColor: theme.palette.control.light,
  border: "2px solid",
  borderColor: theme.palette.control.dark
}));

const CommentIconButton = styled(IconButton)(({ theme }) => ({
  height: 30,
  width: 30
}));
//#endregion

/**
 * コメントパネル表示部
 * WatchVideoNavigationが長大になってきたので分けた
 */
export const WatchVideoComments = memo(({ sx, id, thread, commentDisp, handleChangeCommentDisp, graphDisp, handleChangeGraphDisp, commentIndex, handleFullscreen }) => {
  // Josh認証確認
  const [isJosh] = useLocalStorage('josh', 'false');

  // コメント自動スクロール設定
  const [autoScroll, setAutoScroll] = useState(true);
  const handleAutoScroll = () => {
    setAutoScroll(!autoScroll);
  };

  // コメントリストの参照
  const commentlistRef = useRef();
  useEffect(() => {
    if (!commentlistRef || !autoScroll) return;
    // リストをコメントに合わせて自動スクロール
    commentlistRef.current?.scrollTo((commentIndex - Math.floor(commentlistRef.current.props.height / commentlistRef.current.props.itemSize) + 1) * commentlistRef.current.props.itemSize)
  }, [commentIndex, autoScroll]);

  // 実況スレ登録ダイアログ表示
  const [openRegistDialog, setOpenRegistDialog] = useState(false);
  const handleRegistOpen = () => {
    setOpenRegistDialog(true);
  };
  const handleRegistClose = () => {
    setOpenRegistDialog(false);
  };

  // 動画報告ダイアログの表示
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const handleReportOpen = () => {
    setOpenReportDialog(true);
  };
  const handleReportClose = () => {
    setOpenReportDialog(false);
  };

  const renderRow = ({index, style}) => {
    return (
      <WatchVideoCommentContainer
        key={index}
        style={style}
      >
        <WatchVideoCommentBase
          sx={{
            width: 370,
          }}
        >
          {thread.data.comments[index].body}
        </WatchVideoCommentBase>
        <WatchVideoCommentBase
          sx={{
            width: !isMobile ? 120 : 178,
          }}
        >
          {format(thread.data.comments[index].posMs - (60*60*9 * 1000), "HH:mm:ss")}
        </WatchVideoCommentBase>
      </WatchVideoCommentContainer>
    )
  };

  return (
    <>
      {/**
       * コメントパネル
       */}
      <WatchVideoMainPanelMenuContainer>
        <WatchVideoMainPanelMenuContents
          textAlign="left"
        >
          <CommentTypeSelect>
            {/**
             * 現状役割の無いselect
             * 表/裏コメントの切替対応を行うかもしれない
             */}
            {isJosh === "true" && <option value="99">実況コメント</option>}
          </CommentTypeSelect>
        </WatchVideoMainPanelMenuContents>
        <WatchVideoMainPanelMenuContents
          textAlign="right"
        >
          <CommentIconButton
            disableRipple
            onClick={handleAutoScroll}
          >
            {autoScroll ? <DownloadIcon fontSize="small" /> : <FileDownloadOffIcon fontSize="small" />}
          </CommentIconButton>
          <CommentIconButton
            disableRipple
            onClick={handleChangeCommentDisp}
          >
            {commentDisp ? <InsertCommentIcon fontSize="small" /> : <CommentsDisabledIcon fontSize="small" />}
          </CommentIconButton>
          <CommentIconButton
            disableRipple
            onClick={handleChangeGraphDisp}
          >
            {graphDisp ? <ShowChart fontSize="small" /> : <ShowChart fontSize="small" opacity="0.5" />}
          </CommentIconButton>
          <CommentIconButton
            disableRipple
            onClick={handleFullscreen.enter}
          >
            <Fullscreen fontSize="small" />
          </CommentIconButton>
          {isJosh === "true" && (
            <>
              <CommentIconButton
                disableRipple
                onClick={handleRegistOpen}
              >
                <AppRegistrationIcon fontSize="small" />
              </CommentIconButton>
              <CommentIconButton
                disableRipple
                onClick={handleReportOpen}
              >
                <FlagIcon fontSize="small" />
              </CommentIconButton>
              <RegistThreadDialog
                 open={openRegistDialog}
                 onClose={handleRegistClose}
                 youtubeid={id}
              />
              <VideoReportForm
                open={openReportDialog}
                onClose={handleReportClose}
                youtubeid={id}
              />
            </>
          )}
        </WatchVideoMainPanelMenuContents>
      </WatchVideoMainPanelMenuContainer>
      {/**
       * コメント欄
       */}
      <WatchVideoCommentMain>
        {/**
         * コメント欄ヘッダ
         */}
        <WatchVideoCommentHeader>
          <WatchVideoCommentHeaderContents
            sx={{
              width: 304,
            }}
          >
            コメント
          </WatchVideoCommentHeaderContents>
          <WatchVideoCommentHeaderContents
            sx={{
              width: 120,
            }}
          >
            再生時間
          </WatchVideoCommentHeaderContents>
        </WatchVideoCommentHeader>
        {/**
         * ユーザーコメント一覧表示部
         */}
        <WatchVideoCommentDisplay>
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                ref={commentlistRef}
                itemCount={thread ? thread.data.comments.length : 0}
                itemSize={28}
                height={height}
                width={width}
              >
                {renderRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        </WatchVideoCommentDisplay>
      </WatchVideoCommentMain>
    </>
  )
});
