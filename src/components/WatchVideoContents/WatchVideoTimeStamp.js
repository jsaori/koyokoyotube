import React, { memo, useState } from "react";

import styled from "@emotion/styled";
import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import parse, {domToReact} from "html-react-parser";
import { Link, useLocation } from "react-router-dom";

import { TimeToSeconds } from "../../libs/utilities";
import { WatchVideoMainPanelMenuContainer, WatchVideoMainPanelMenuContents } from "../shared/StyledComponents";

//#region ユーザー定義スタイルコンポーネント

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
  padding: "8px",
  [theme.breakpoints.up('md')]: {
    height: "100%",
    width: 384,
  },
  [theme.breakpoints.down('md')]: {
    height: `calc(100vh - 500px)`,
    width: "100%",
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    width: 200,
  },
  [theme.breakpoints.down('md')]: {
    width: "100%",
  },
  "& .MuiOutlinedInput-root": {
    height: 32,
    fontSize: 14,
    color: theme.palette.control.contrastText,
    backgroundColor: theme.palette.control.light,
    "& fieldset": {
      borderColor: theme.palette.control.dark,
      borderWidth: "2px",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.control.dark,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.control.dark,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: 14,
    color: theme.palette.control.contrastText,
  },
}));

const TimeStampGroup = styled(Box)(({ theme }) => ({
  marginBottom: "12px",
  borderRadius: "8px",
  backgroundColor: theme.palette.paper.light || theme.palette.background.paper,
  border: `1px solid ${theme.palette.paper.contrastBorder || theme.palette.divider}`,
  overflow: "hidden",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  "&:last-child": {
    marginBottom: 0,
  },
}));

const TimeStampDetailItem = styled(Box)(({ theme }) => ({
  padding: "8px 16px 12px 32px",
  backgroundColor: "transparent",
  borderTop: `1px solid ${theme.palette.paper.contrastBorder || theme.palette.divider}`,
  transition: "background-color 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  fontSize: 12,
  color: theme.palette.text.secondary,
}));

const TimeStampText = styled(Box)(({ theme }) => ({
  fontSize: 13,
  lineHeight: 1.6,
  "& a": {
    color: theme.palette.primary.main,
    textDecoration: "none",
    fontWeight: 500,
    padding: "2px 4px",
    borderRadius: "4px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.dark,
    },
  },
}));

const TimeStampDetailText = styled(Box)(({ theme }) => ({
  fontSize: 12,
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
}));

const TimeStampHeaderItem = styled(Box)(({ theme }) => ({
  padding: "12px 16px",
  backgroundColor: theme.palette.action.selected || theme.palette.action.hover,
  fontWeight: 600,
  fontSize: 14,
  color: theme.palette.text.primary,
  borderBottom: `2px solid ${theme.palette.paper.contrastBorder || theme.palette.divider}`,
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

  // タイムスタンプ行をグループ化する関数
  // 見出し行（先頭にリンクがある行）と、その後に続く先頭がリンクでない行を1つのグループとして扱う
  const groupTimeStampLines = (lines) => {
    const groups = [];
    let currentGroup = null;

    lines.forEach((line, index) => {
      if (line.match(/<br>/)) {
        // <br>タグは無視
        return;
      }

      if (!line.trim()) {
        // 空行は無視
        return;
      }

      // 行の先頭（空白を除く）にリンク（<a>タグ）があるかチェック
      const trimmedLine = line.trim();
      const startsWithLink = /^<a\s+[^>]*href/i.test(trimmedLine);

      if (startsWithLink) {
        // 先頭にリンクがある行 = 見出し行
        // 現在のグループを保存して、新しいグループを開始
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          header: line,
          detailLines: [],
          index: groups.length,
        };
      } else {
        // 先頭がリンクでない行 = 現在の見出し行のグループに追加
        if (currentGroup) {
          currentGroup.detailLines.push(line);
        } else {
          // 見出し行がない場合は単独のグループとして扱う
          currentGroup = {
            header: null,
            detailLines: [line],
            index: groups.length,
          };
        }
      }
    });

    // 最後のグループを追加
    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
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
          <StyledFormControl size="small" variant="outlined">
            <InputLabel id="timestamp-author-select-label">投稿者</InputLabel>
            <Select
              labelId="timestamp-author-select-label"
              id="timestamp-author-select"
              value={authNo}
              onChange={handleAuthChange}
              label="投稿者"
            >
              {timeStamp.map((stamp, index) => (
                <MenuItem key={`stamp-${index}-${stamp.displayName}`} value={index}>
                  {stamp.displayName}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </WatchVideoMainPanelMenuContents>
      </WatchVideoMainPanelMenuContainer>
      {/**
       * タイムスタンプ欄
       */}
      <WatchVideoTimeStampMain>
        <WatchVideoTimeStampDisplay>
          {(() => {
            const lines = timeStamp[authNo]?.text.split(/(<br>)/) || [];
            const groups = groupTimeStampLines(lines);

            return groups.map((group, groupIndex) => (
              <TimeStampGroup key={`group-${authNo}-${groupIndex}`}>
                {group.header && (
                  <TimeStampHeaderItem>
                    <TimeStampText>
                      {parse(group.header, {replace})}
                    </TimeStampText>
                  </TimeStampHeaderItem>
                )}
                {group.detailLines.map((detailLine, detailIndex) => (
                  <TimeStampDetailItem key={`detail-${authNo}-${groupIndex}-${detailIndex}`}>
                    <TimeStampDetailText>
                      {parse(detailLine, {replace})}
                    </TimeStampDetailText>
                  </TimeStampDetailItem>
                ))}
              </TimeStampGroup>
            ));
          })()}
        </WatchVideoTimeStampDisplay>
      </WatchVideoTimeStampMain>
    </>
  )
});
