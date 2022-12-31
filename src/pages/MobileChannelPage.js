import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { Box, Tab, Tabs } from "@mui/material";

import MobilePlayListPage from "./MobilePlayListPage";
import MobileVideoPage from "./MobileVideoPage";
import { useLocalStorage } from "../hooks/useLocalStrage";
import JPage from "./JPage";

//#region ユーザー定義スタイルコンポーネント
const ChannelMainBox = styled(Box)({
  maxWidth: window.screen.width,
  margin: '0 auto'
});

const ChannelPageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  borderBottom: 1,
  borderColor: 'divider',
  position: 'sticky',
  top: 48,
  backgroundColor: theme.palette.paper.main,
  zIndex: 2
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
        <Box sx={{ pt: 3 }}>
          <Box conponent="span">{children}</Box>
        </Box>
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

const TabPageKey = {
  0: "playlist",
  1: "video",
  99: "j"
};

/**
 * モバイル用動画閲覧ページ
 */
 export default function MobileChannelPage({ subpage }) {
  // ルーティング用関数
  const navigate = useNavigate();

  // チャンネルの取得
  const chname = useParams().chname;

  // 選択されているタブを管理
  const [tabId, setTabId] = useState(subpage);
  useEffect(() => {
    setTabId(subpage);
  }, [subpage]);

  const handleTabIdChange = (event, newTabId) => {
    // タブの変更
    setTabId(newTabId);
    // タブに合わせてURL更新
    navigate(`/channel/${chname}/${TabPageKey[newTabId]}`);
  };

  const [isJosh] = useLocalStorage('josh', 'false');

  return (
    <>
      {/**
       * 他ホロメン選択項目を追加するならここ
       * <ChannelMainBox>
       * </ChannelMainBox>
       */}
      <ChannelPageContainer>
        <ChannelMainBox>
          {/**
           * 他ホロメン選択時に誰が選択されているか表示するならここ
           * <>博衣こより</>
           */}
          <Tabs
            value={tabId}
            onChange={handleTabIdChange}
            aria-label="tabs"
          >
            <Tab label="再生リスト" {...a11yProps(0)} disableRipple />
            <Tab label="動画一覧" {...a11yProps(1)} disableRipple />
            {isJosh === 'true' && <Tab label="実況スレ登録" {...a11yProps(99)} disableRipple />}
          </Tabs>
        </ChannelMainBox>
      </ChannelPageContainer>
      <ChannelMainBox>
        <TabPanel value={tabId} index={0}>
          {/**
           * プレイリストタブ - 0
           */}
          <MobilePlayListPage chname={chname} />
        </TabPanel>
        <TabPanel value={tabId} index={1}>
          {/**
           * 動画一覧タブ - 1
           */}
          <MobileVideoPage chname={chname} />
        </TabPanel>
        <TabPanel value={tabId} index={99}>
          {/**
           * 動画一覧タブ - 99
           */}
          <JPage />
        </TabPanel>
      </ChannelMainBox>
    </>
  )
}
