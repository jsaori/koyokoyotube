import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FolderIcon from '@mui/icons-material/Folder';
import { ListItemIcon, ListItemText } from "@mui/material";

import { SideContainerListItem, SideContainerListItemButton } from "../shared/StyledComponents";

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