import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styled from "@emotion/styled";
import FolderIcon from '@mui/icons-material/Folder';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";

//#region ユーザー定義スタイルコンポーネント
const SideContainerListItem = styled(ListItem)({
  dense: "true",
  height: 40
});

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
 * サイドバーコンポーネント：ヘッダ
 * 再生リスト一覧用
 */
export const PlayListSideContainerItem = memo(({ text, selected }) => {
  // ルーティング用
  const navigate = useNavigate();
  const param = useParams();

  // ボタンクリックイベント
  const handleClickItem = () => {
    navigate("/channel/" + param.chname + "/playlist");
  };

  return (
    <SideContainerListItem
      disablePadding
    >
      <SideContainerListItemButton
        disableRipple
        selected={selected}
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

/**
 * サイドバーコンポーネント：アイコン付き
 * 再生リスト一覧用
 */
export const PlayListSideContainerIconItem = memo(({ text, listId, selected }) => {
  // ルーティング用
  const navigate = useNavigate();
  const param = useParams();

  // ボタンクリックイベント
  const handleClickItem = () => {
    navigate("/channel/" + param.chname + "/playlist/" + listId);
  };

  return (
    <SideContainerListItem
      disablePadding
    >
      <SideContainerListItemButton
        disableRipple
        selected={selected}
        onClick={handleClickItem}
      >
        <ListItemIcon style={{ minWidth: 30 }}>
          <FolderIcon fontSize="small" />
        </ListItemIcon>
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