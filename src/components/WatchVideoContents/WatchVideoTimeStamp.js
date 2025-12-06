import React, { memo, useState } from "react";

import styled from "@emotion/styled";
import { Box } from "@mui/material";
import parse, {domToReact} from "html-react-parser";
import { Link, useLocation } from "react-router-dom";

import { TimeToSeconds } from "../../libs/utilities";

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

const WatchVideoTimeStampMain = styled(Box)(({ theme }) => ({
  bottom: 0,
  fontSize: 13,
  left: 0,
  [theme.breakpoints.up('md')]: {
    position: "absolute",
  },
  [theme.breakpoints.down('md')]: {
    position: "relative",
  },
  right: 0,
  top: 40,
  display: "flex",
  flexDirection: "column",
  width: "100%"
}));

const WatchVideoTimeStampDisplay = styled(Box)(({ theme }) => ({
  overflowY: "auto",
  overflowX: "hidden",
  [theme.breakpoints.up('md')]: {
    height: "100%",
    width: 384,
  },
  [theme.breakpoints.down('md')]: {
    height: `calc(100vh - 500px)`,
    width: "100%",
  },
}));

const TimeStampAuthSelect = styled("select")(({ theme }) => ({
  height: 24,
  fontSize: 14,
  color: theme.palette.control.contrastText,
  backgroundColor: theme.palette.control.light,
  border: "2px solid",
  borderColor: theme.palette.control.dark,
  [theme.breakpoints.up('md')]: {
    width: 200,
  },
  [theme.breakpoints.down('md')]: {
    width: "100%",
  },
}));
//#endregion

/**
 * タイムスタンプパネル表示部
 * タイムスタンプによる再生時間ジャンプ
 */
export const WatchVideoTimeStamp = memo(({ sx, timeStamp }) => {
  // タイムスタンプ投稿者選択
  const [authNo, setAuthNo] = useState(0);
  const handleAuthChange = (e) => {
    setAuthNo(e.target.value);
  };

  // タイムスタンプコメント文字列からリンクを抽出しkoyokoyotubeのリンクに変換
  // とりあえずURLクエリは増やさずstateを渡して再生時間のジャンプを行う
  const location = useLocation();
  const replace = (domNode) => {
    if (domNode.name === "a" && domNode.attribs.href && domNode.children.length > 0) {
      return (
        <Link
          to={{
            pathname: `${location.pathname}`,
            search: `${location.search}`
          }}
          state={{jumpTime: TimeToSeconds(domNode.children[0].data)}}
        >
          {domToReact(domNode.children)}
        </Link>
      )
    }
  }

  return (
    <>
      {/**
       * タイムスタンプパネル
       */}
      <WatchVideoMainPanelMenuContainer>
        <WatchVideoMainPanelMenuContents
          textAlign="left"
        >
          <TimeStampAuthSelect
            value={authNo}
            onChange={handleAuthChange}
          >
            {timeStamp.map((stamp, index) => (
              <React.Fragment key={index}>
                <option value={index}>{stamp.displayName}</option>
              </React.Fragment>
            ))}
          </TimeStampAuthSelect>
        </WatchVideoMainPanelMenuContents>
      </WatchVideoMainPanelMenuContainer>
      {/**
       * タイムスタンプ欄
       */}
      <WatchVideoTimeStampMain>
        <WatchVideoTimeStampDisplay>
          {timeStamp[authNo]?.text.split(/(<br>)/).map((line, index) => (
            <React.Fragment key={index}>
              {line.match(/<br>/) ? <br /> : (
                <>
                  {parse(line, {replace})}
                </>
              )}
            </React.Fragment>
          ))}
        </WatchVideoTimeStampDisplay>
      </WatchVideoTimeStampMain>
    </>
  )
});
