import { memo, useState } from "react";

import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Link, Radio, RadioGroup, Snackbar } from "@mui/material";
import styled from "@emotion/styled";
import { Controller, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useUpdateRealtimeDB } from "../../hooks/useRealtimeDB";

const CommitButton = styled(Button)((theme) => ({
  marginTop: 16,
  width: 70
}));

export const VideoReportForm = memo((props) => {
  const {onClose, open, youtubeid} = props;
  const uuid = createUuid();

  // 動画コメント報告クライアントバリデーションルール
  const schema = yup.object({
    report: yup
      .number()
      .min(0)
      .max(2)
      .required("チェックが必要です")
  });

  const {
    reset,
    control,
    handleSubmit,
    // error message
    formState: { errors }
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  // フォームの送信処理
  const [, updateThreadData] = useUpdateRealtimeDB();
  const [openSnack, setOpenSnack] = useState(false);
  const onSubmit = (data) => {
    const json = {};
    json.youtubeid = youtubeid;
    json.reportno = data.report;
    updateThreadData(`/report/${uuid}`, json);
    handleClose();
    setOpenSnack(true);
  }
  const handleCloseSnack = () => {
    setOpenSnack(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return(
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          動画コメントを報告
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            生成されたコメントに問題がある場合報告してください<br />
            その他の報告は<Link href={`https://github.com/jsaori/koyokoyotube/issues`} rel="noopener noreferrer" target="_blank" underline="always">GithubのIssues</Link>上で対応します
          </DialogContentText>
          <Controller
            name={"report"}
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                value={field.value === undefined ? '' : field.value}
              >
                <FormControlLabel value={0} control={<Radio />} label="コメント時間が大幅にずれている" />
                <FormControlLabel value={1} control={<Radio />} label="スクリプトが大量に発生している" />
                <FormControlLabel value={2} control={<Radio />} label="動画と関係のないスレが登録されている" />
              </RadioGroup>
            )}
          />
          {"report" in errors && (
            <DialogContentText
              color="red"
            >
              {`*${errors.report.message}`}
            </DialogContentText>
          )}
          <CommitButton
            variant="contained"
            disableElevation
            onClick={handleSubmit(onSubmit)}
          >
            送信
          </CommitButton>
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
        open={openSnack}
        onClose={handleCloseSnack}
        message="報告が送信されました"
      />
    </>
  )
});

// 一意のIDを生成
function createUuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(a) {
      let r = (new Date().getTime() + Math.random() * 16)%16 | 0, v = a === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
   });
}