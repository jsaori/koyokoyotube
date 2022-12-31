import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { memo } from "react";
import { RegistThread } from "./RegistThread";

export const RegistThreadDialog = memo((props) => {
  const {onClose, open, youtubeid} = props;
  const handleClose = () => {
    onClose();
  };

  return(
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        スレ登録
      </DialogTitle>
      <DialogContent>
        <RegistThread defaultYoutubeURL={`https://www.youtube.com/watch?v=${youtubeid}`} />
      </DialogContent>
    </Dialog>
  )
});