import React, { memo, useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Box, Link, Typography } from "@mui/material";

import { useRealtimeDBListener } from "../../hooks/useRealtimeDB";
import { getVideoTitle } from "../../libs/initYoutube";

//#region ユーザー定義スタイルコンポーネント
const JBox = styled(Box)((theme) => ({
  width: "100%",
}));

const SubSectionTypography = styled(Typography)({
  variant:"h2",
  fontSize: '1.2rem',
  marginTop:'1.5rem',
  marginBottom:'1rem'
});

const BodySectionTypography = styled(Typography)({
  variant:"body1",
  component:"p",
  fontSize: '1rem',
});

const URLTypography = styled(Typography)({
  variant:"body1",
  component:"p",
  fontSize: '1rem',
  marginLeft: 32
});
//#endregion

/**
 * 実況スレ登録待ち確認
 */
export const PendingThread = memo(({ sx }) => {
  // 登録待ち情報取得
  const [pendingData] = useRealtimeDBListener({"": {threads: []}}, "/thread", "update", true);
  // タイトル
  const [titles, setTitles] = useState({});
  useEffect(() => {
    const exec = async () => {
      let obj = {};
      await Promise.all(Object.keys(pendingData).map(async (key) => {
        if (key === "") return;
        if (obj[key]) return;
        obj[key] = {};
        obj[key].title = await getVideoTitle(key);
      }));
      setTitles((titles) => Object.assign(obj, titles));
    };
    exec();
  }, [pendingData]);

  return (
    <JBox
      sx={sx}
    >
      <SubSectionTypography>
        🧪登録待ち情報🧪
      </SubSectionTypography>
      <BodySectionTypography>
        登録して頂いた情報が以下にリアルタイムで反映されます.<br />
        ここから表示が消えればコメント登録が完了しています.<br />
        ※動画にコメントが反映されていない場合キャッシュを削除すれば反映されるかもしれません.もしくはバグ※<br /><br />
      </BodySectionTypography>
      {Object.keys(pendingData).map((key, index) => (
        <React.Fragment key={index}>
          <Link href={`https://www.youtube.com/watch?v=${key}`} rel="noopener noreferrer" target="_blank" underline="always">{titles[key]?.title}</Link>
          {pendingData[key].threads.map((thread, i) => (
            <URLTypography key={i}>
              {`${thread.url}`}<br />
            </URLTypography>
          ))}
        </React.Fragment>
      ))}
    </JBox>
  )
});