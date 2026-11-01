import { memo, useState } from "react";

import { Dialog, DialogContent, DialogTitle, Slider, Box, Typography, Switch, FormControlLabel, Popover } from "@mui/material";
import { SketchPicker } from 'react-color';

/**
 * コメント表示設定ダイアログ
 */
export const WatchVideoCommentSettingsDialog = memo((props) => {
  const { onClose, open, commentColor, commentAlpha, commentSizeScale, setCommentColor, setCommentAlpha, setCommentSizeScale, commentDisp, handleChangeCommentDisp, graphDisp, handleChangeGraphDisp, commentTimeOffset, setCommentTimeOffset } = props;

  const [colorPickerAnchor, setColorPickerAnchor] = useState(null);

  const handleClose = () => {
    onClose();
  };

  const handleSizeScaleChange = (event, newValue) => {
    setCommentSizeScale(newValue);
  };

  const handleTimeOffsetChange = (event, newValue) => {
    setCommentTimeOffset(newValue);
  };

  const handleColorPickerOpen = (event) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const handleColorChange = (color) => {
    // RGB値を16進数に変換
    const hex = color.hex;
    setCommentColor(hex);
    // 透明度を0-1の範囲に変換（react-colorは0-100で返す）
    setCommentAlpha(color.rgb.a !== undefined ? color.rgb.a : commentAlpha);
  };

  // 現在の色と透明度をRGBA形式に変換
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const currentRgb = hexToRgb(commentColor) || { r: 255, g: 255, b: 255 };
  const currentColor = {
    r: currentRgb.r,
    g: currentRgb.g,
    b: currentRgb.b,
    a: commentAlpha
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        コメント表示設定
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={commentDisp}
                onChange={handleChangeCommentDisp}
              />
            }
            label="コメント表示"
          />
        </Box>
        {handleChangeGraphDisp && (
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={graphDisp}
                  onChange={handleChangeGraphDisp}
                />
              }
              label="コメントグラフ表示"
            />
          </Box>
        )}
        <Box sx={{ mt: 2, mb: 4 }}>
          <Typography gutterBottom>
            色と透明度
          </Typography>
          <Box
            onClick={handleColorPickerOpen}
            sx={{
              mt: 1,
              width: '100%',
              height: 40,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentColor.a < 0.5 ? 'text.primary' : 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontSize: '0.875rem'
            }}
          >
            {commentColor.toUpperCase()} {Math.round(commentAlpha * 100)}%
          </Box>
          <Popover
            open={Boolean(colorPickerAnchor)}
            anchorEl={colorPickerAnchor}
            onClose={handleColorPickerClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
              disableAlpha={false}
            />
          </Popover>
        </Box>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography gutterBottom>
            サイズ倍率: {commentSizeScale.toFixed(2)}x
          </Typography>
          <Slider
            value={commentSizeScale}
            onChange={handleSizeScaleChange}
            min={0.5}
            max={2.0}
            step={0.1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value.toFixed(1)}x`}
            sx={{ mt: 2 }}
          />
        </Box>
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography gutterBottom>
            コメントタイミング調整: {commentTimeOffset === 0 ? '0秒' : commentTimeOffset > 0 ? `+${commentTimeOffset.toFixed(1)}秒` : `${commentTimeOffset.toFixed(1)}秒`}
          </Typography>
          <Slider
            value={commentTimeOffset}
            onChange={handleTimeOffsetChange}
            min={-30}
            max={30}
            step={0.5}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => value === 0 ? '0秒' : value > 0 ? `+${value.toFixed(1)}秒` : `${value.toFixed(1)}秒`}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
});
