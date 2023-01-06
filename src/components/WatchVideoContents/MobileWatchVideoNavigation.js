import { memo, useState } from "react";

import styled from "@emotion/styled";
import { Box, Tab, Tabs } from "@mui/material";
import { WatchVideoComments } from "./WatchVideoComments";
import { WatchVideoPlaylist } from "./WatchVideoPlaylist";
import { WatchVideoTimeStamp } from "./WatchVideoTimeStamp";

//#region ユーザー定義スタイルコンポーネント
const WatchVideoMainPanelContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.control.light,
  position: "relative",
  zIndex: 2
}));

const WatchVideoMainPanelBody = styled(Box)(({ theme }) => ({
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  left: 0,
  position: "absolute",
  right: 0,
  top: 48,
}));
//#endregion

// タブ変更で切り替わるコンポーネント規定(MUIのコードコピペ)
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <>
          <Box conponent="span">{children}</Box>
        </>
      )}
    </div>
  );
}

// タブ変更によるコンポーネント切り替えのためのプロパティ設定(MUIのコードコピペ)
function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
    value: index
  };
}

/**
 * 動画横のコメント表示/プレイリスト動画表示を行う
 */
export const MobileWatchVideoNavigation = memo(({ sx, id, thread, commentDisp, handleChangeCommentDisp, commentIndex, timeStamp }) => {
  // 選択されているタブを管理
  const [tabId, setTabId] = useState(0);
  const handleTabIdChange = (event, newTabId) => {
    // タブの変更
    setTabId(newTabId);
  };

  return (
    <WatchVideoMainPanelContainer>
      {/**
       * コメント & 動画リスト切り替えヘッダ
       */}
      <Tabs
        value={tabId}
        onChange={handleTabIdChange}
        variant="fullWidth"
        aria-label="tabs"
      >
        <Tab label="コメント" {...a11yProps(0)} disableRipple />
        <Tab label="スタンプ" {...a11yProps(1)} disableRipple />
        <Tab label="動画リスト" {...a11yProps(2)} disableRipple />
      </Tabs>
      {/**
       * 以下コメント欄ボディ部
       */}
      <WatchVideoMainPanelBody>
        <TabPanel  value={tabId} index={0}>
          {/**
           * コメントパネル
           */}
          <WatchVideoComments
            id={id}
            thread={thread}
            commentDisp={commentDisp}
            handleChangeCommentDisp={handleChangeCommentDisp}
            commentIndex={commentIndex}
          />
        </TabPanel>
        <TabPanel  value={tabId} index={1}>
          {/**
           * タイムスタンプパネル
           */}
          <WatchVideoTimeStamp
            timeStamp={timeStamp}
          />
        </TabPanel>
        <TabPanel value={tabId} index={2}>
          {/**
           * 関連動画パネル
           */}
          <WatchVideoPlaylist id={id} />
        </TabPanel>
      </WatchVideoMainPanelBody>
    </WatchVideoMainPanelContainer>
  )
});