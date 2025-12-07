import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../../libs/InitFirebase";

/**
 * 画像報告ダイアログコンポーネント
 */
export const MediaReportDialog = ({ open, onClose, videoId, mediaId, imageSrc }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleReport = async () => {
    if (!videoId || !mediaId) {
      setError("動画IDまたはメディアIDが指定されていません");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const mediaRef = doc(firestore, `videos/${videoId}/media/${mediaId}`);
      
      // reportedCountをインクリメント
      await updateDoc(mediaRef, {
        reportedCount: increment(1),
      });

      setSuccess(true);
      // 成功後、少し待ってからダイアログを閉じる
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setError(null);
      }, 1500);
    } catch (err) {
      console.error("Error reporting media:", err);
      setError("報告の送信に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>画像を報告</DialogTitle>
      <DialogContent>
        {imageSrc && (
          <img
            src={imageSrc}
            alt="報告対象の画像"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              marginBottom: "16px",
            }}
          />
        )}
        <Typography variant="body1" gutterBottom>
          この画像を不適切なコンテンツとして報告しますか？
        </Typography>
        <Typography variant="body2" color="text.secondary">
          報告された画像は管理者が確認し、適切な対応を行います。
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            報告を送信しました。ご協力ありがとうございます。
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleReport}
          variant="contained"
          color="error"
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "送信中..." : "報告する"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
