import { useState, useCallback, useMemo } from "react";
import { Box, Dialog, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { format } from "date-fns";
import { MediaReportDialog } from "./MediaReportDialog";

/**
 * 画像拡大表示Dialogコンポーネント
 */
export const EnlargedImageDialog = ({ media, onClose }) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  // 右クリックで報告ダイアログを開く
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (media?.videoId && media?.id) {
      setReportDialogOpen(true);
    }
  }, [media]);

  // 表示用の情報をフォーマット
  const infoText = useMemo(() => {
    if (!media) return "";
    
    const parts = [];
    
    // 再生時間
    if (media.posMs !== undefined) {
      const posMs = Number(media.posMs) || 0;
      const timeString = format(posMs - (60*60*9 * 1000), "HH:mm:ss");
      parts.push(timeString);
    }
    
    // 投稿日時
    if (media.postedAt) {
      parts.push(`（${media.postedAt}）`);
    }
    
    // userThreadId
    if (media.userThreadId) {
      parts.push(`[${media.userThreadId}]`);
    }
    
    // userBBSId
    if (media.userBBSId) {
      parts.push(`[${media.userBBSId}]`);
    }
    
    return parts.join("");
  }, [media]);
  return (
    <Dialog
      open={media !== null}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: 'none',
          maxWidth: '90vw',
          maxHeight: '90vh',
          m: 2,
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1,
          }}
          aria-label="閉じる"
        >
          <CloseIcon />
        </IconButton>
        {media?.src && (
          <>
            <img
              src={media.src}
              alt="拡大画像"
              style={{
                maxWidth: '90vw',
                maxHeight: 'calc(90vh - 60px)',
                objectFit: 'contain',
              }}
              onContextMenu={handleContextMenu}
            />
            {infoText && (
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  mt: 2,
                  textAlign: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                {infoText}
              </Typography>
            )}
          </>
        )}
      </Box>
      {media?.videoId && media?.id && (
        <MediaReportDialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          videoId={media.videoId}
          mediaId={media.id}
          imageSrc={media.src}
        />
      )}
    </Dialog>
  );
};

