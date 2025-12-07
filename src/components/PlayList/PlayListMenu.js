import { memo } from "react";

import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { ListSelect } from "../shared/StyledComponents";
import { useQueryString } from "../../hooks/useQueryString";

//#region ユーザー定義スタイルコンポーネント
const PlayListMenuMain = styled(Box)(({ theme }) => ({
  alignItems: "center"
}));

const PlayListMenuSelection = styled(Box)(({ theme }) => ({
  marginTop: 16,
  display: "flex",
  flexWrap: "wrap"
}));

const VideoListSelect = ListSelect;
//#endregion

export const PlayListMenu = memo(({ sx, sort }) => {
  const { updateQuery } = useQueryString();

  // ドロップダウン変更イベント
  const handleSelectChange = (e) => {
    updateQuery({ sort: e.target.value });
  };

  return (
    <PlayListMenuMain {...sx}>
      {/**
       * 動画のソート選択ドロップダウン
       */}
      <PlayListMenuSelection>
        <VideoListSelect
          value={sort}
          onChange={handleSelectChange}
          sx={{
            maxHeight: 32,
            fontSize: 13
          }}
        >
          <option value="publishDesc">公開日時が新しい順</option>
          <option value="publishAsc">公開日時が古い順</option>
          <option value="durationDesc">再生時間が長い順</option>
          <option value="durationAsc">再生時間が短い順</option>
          <option value="titleDesc">タイトル昇順</option>
          <option value="titleAsc">タイトル降順</option>
        </VideoListSelect>
      </PlayListMenuSelection>
    </PlayListMenuMain>
  )
});