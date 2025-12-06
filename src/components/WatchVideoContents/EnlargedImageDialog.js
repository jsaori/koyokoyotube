import { Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

/**
 * 画像拡大表示Dialogコンポーネント
 */
export const EnlargedImageDialog = ({ enlargedImageSrc, onClose }) => {
  return (
    <Dialog
      open={enlargedImageSrc !== null}
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
          }}
          aria-label="閉じる"
        >
          <CloseIcon />
        </IconButton>
        {enlargedImageSrc && (
          <img
            src={enlargedImageSrc}
            alt="拡大画像"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>
    </Dialog>
  );
};

