import { memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styled from "@emotion/styled";
import { Box } from "@mui/material";
import queryString from "query-string";
import { ListSelect } from "../shared/StyledComponents";

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
  const navigate = useNavigate();
  const location = useLocation();

  const query = queryString.parse(location.search);

  // ドロップダウン変更イベント
  const handleSelectChange = (e) => {
    let queryStr = "";
    query.sort = e.target.value;
    Object.keys(query).forEach((key, index) => {
      if (queryStr !== "") queryStr += "&";
      queryStr += key + "=" + query[key];
    });
    navigate({
      pathname: location.pathname,
      search: queryStr
    })
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