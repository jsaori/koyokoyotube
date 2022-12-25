import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styled from "@emotion/styled";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";

//#region ユーザー定義スタイルコンポーネント
const SideContainerListItem = styled(ListItem)(({ theme }) => ({
  dense: "true",
  height: 40
}));

const SideContainerListItemButton = styled(ListItemButton)(({ theme }) => ({
  height: 40,
  '&.Mui-selected': {
    color: theme.palette.primary.dark,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    }
  },
  '&:hover, &.Mui-selected:hover': {
    color: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.light,
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.dark,
    }
  }
}));
//#endregion

/**
 * サイドバーコンポーネント
 * 動画一覧用
 */
export const VideoListSideContainerItem = memo(({ text }) => {
  // ルーティング用
  const navigate = useNavigate();
  const param = useParams();

  // ボタンクリックイベント
  const handleClickItem = () => {
    navigate("/channel/" + param.chname + "/video");
  };

  return (
    <SideContainerListItem
      disablePadding
    >
      <SideContainerListItemButton
        disableRipple
        selected
        onClick={handleClickItem}
      >
        <ListItemText
          primary={`${text}`}
          primaryTypographyProps={{
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.8rem'
            }
          }}
        />
      </SideContainerListItemButton>
    </SideContainerListItem>
  )
});
