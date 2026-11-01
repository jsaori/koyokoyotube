import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ListItemText } from "@mui/material";

import { SideContainerListItem, SideContainerListItemButton } from "../shared/StyledComponents";

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
