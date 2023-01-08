import React, { memo, useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Backdrop, Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, Snackbar, Stack, TextField } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'

import { useGetRealtimeDB, useUpdateRealtimeDB } from "../../hooks/useRealtimeDB";
import { getVideoTitle } from "../../libs/initYoutube";

//#region ユーザー定義スタイルコンポーネント
const JBox = styled(Box)((theme) => ({
  width: "100%",
}));

const FlexTextForm = styled(TextField)({
  width: "100%",
});

const SimulCheckBox = styled(Box)({
  paddingLeft: 10
});

const TextAreaYoutube = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const TextArea = styled(Box)({
  display: "flex",
  alignItems: "flex-end",
});

const CommitButton = styled(Button)((theme) => ({
  marginTop: 16,
  width: 70
}));
//#endregion

/**
 * 実況スレ登録
 */
export const RegistThread = memo(({ sx, defaultYoutubeURL="" }) => {
  const blankThread = {url: ""};

  // 登録実況スレURL重複確認
  // URLの実質的な重複確認はルーティングの設定に依存するため表面的な確認は不十分
  // ※直接アクセスして確認することは可能. 5chはGone判定が厳しいので却下
  // ※実況スレURLが重複することのデメリットはDBに無駄な要素が増える点のみ
  const validateDuplicatedThreads = (thread) => {
    // スラッシュを全て抜いた文字列で比較を行う
    const data = [...registeredData.threads, ...watchThreads.filter(v => v.url.replace(/\//g, '') !== thread.replace(/\//g, ''))];
    return (!data.find((v => v.url.replace(/\//g, '') === thread.replace(/\//g, '')))
            && watchThreads.filter(v => v.url.replace(/\//g, '') !== thread.replace(/\//g, '')).length + 1 === watchThreads.length);
  }

  // 実況スレ登録クライアントバリデーションルール
  const THREAD_MIN = 1;
  const THREAD_MAX = 50;
  const STRING_MAX = 100;
  const schema = yup.object({
    youtubeurl: yup
      .string()
      .required("Youtube URL は必須です")
      .url("URLが不正です")
      .max(STRING_MAX, "URLが不正です")
      .matches(/(youtube\.com|youtu\.be)?(.+\?v=|\/)([a-zA-Z0-9\-_]{11})/, { message: "URLが不正です"}),
    simul: yup
      .bool()
      .required(),
    simuldatetime: yup
      .string()
      .when('simul', (simul, schema) => {
        return simul ? schema.required("開始時間 は必須です") : schema
      }),
    threads: yup
      .array(
        yup.object().shape({
          url: yup
            .string()
            .required("実況スレ URL は必須です")
            .url("URLが不正です")
            .max(STRING_MAX, "URLが不正です")
            .matches(/((5ch.net).+\/([0-9]{10})|((shitaraba.net).+\/25835\/([0-9]{10})))($|\/)/, { message: "URLが不正です"})
            .test("duplicated-threads", "実況スレURLが重複しています", validateDuplicatedThreads)
        }),
      )
      .min(THREAD_MIN, `実況スレ URL: ${THREAD_MIN}以上の登録が必要です`)
      .max(THREAD_MAX, `実況スレ URL: ${THREAD_MAX}以下の登録が必要です`)
  });

  const {
    // 入力データのrefとvalidationをreact hook formに登録
    register,
    // 値の監視
    watch,
    // フォームリセット
    reset,
    // react hook formに登録したコンポーネント(useFieldArrayに渡す)
    control,
    // validation成功でフォームデータを渡す
    handleSubmit,
    // force value change
    setValue,
    // error message
    formState: { errors }
  } = useForm({
    // デフォルト値
    defaultValues: {
      youtubeurl: defaultYoutubeURL,
      simul: false,
      simuldatetime: "",
      threads: [blankThread]
    },
    // validation trigger: submit時チェック
    mode: "onSubmit",
    // validation yup
    resolver: yupResolver(schema),
  });

  // コンポーネントの配列へのregist管理
  const { fields, append, remove} = useFieldArray({
    control,
    name: "threads"
  });

  // フォーム値の監視
  // 同時視聴時は開始時間を設定する
  const watchCheckSimul = watch("simul");
  // YoutubeURL設定時に登録済みスレを取得する
  const watchYoutubeURL = watch("youtubeurl");
  const watchThreads = watch("threads");

  // フォーム送信処理
  const [sending, updateThreadData] = useUpdateRealtimeDB();
  const [openSnack, setOpenSnack] = useState(false);
  const onSubmit = (data) => {
    const json = {};
    json.simul = data.simul ?? false;
    json.simulDatetime = data.simul ? data.simuldatetime : "";

    json.threads = [...registeredData.threads, ...data.threads];
    json.update = true;
    updateThreadData(`/thread/${youtubeId}`, json);
    // 送信後フォームのリセットを行う
    reset({
      youtubeurl: defaultYoutubeURL,
      simuldatetime: "",
      threads: [blankThread]
    });

    setOpenSnack(true);
  };

  const handleCloseSnack = () => {
    setOpenSnack(false);
  };

  // Youtube URLからIDを抽出
  // こよスレは短縮URLや不要なURLパラメータがくっついている等パターンがあるので考慮する
  const [youtubeId, setYoutubeId] = useState("");
  useEffect(() => {
    if (watchYoutubeURL === "") {
      setYoutubeId("");
      return;
    }
    const youtubeMatch = watchYoutubeURL.match(/(youtube\.com|youtu\.be)?(.+\?v=|\/)([a-zA-Z0-9\-_]{11})($|[&,?])/);
    const youtubeid = youtubeMatch?.find((v) => v?.length === 11);
    if (!youtubeMatch?.find((v) => v?.match(/(youtube|youtu.be)/)) || !youtubeid) {
      setYoutubeId("");
      return;
    }
    setYoutubeId(youtubeid);
  }, [watchYoutubeURL]);

  // Youtube動画IDに紐付く実況情報を取得
  const [registeredData, getRegisteredData, resetRegisteredData] = useGetRealtimeDB({threads: []});
  useEffect(() => {
    if (sending) return;
    // 動画Id未登録なら情報リセット
    if (youtubeId === "") {
      resetRegisteredData({threads: []});
    } else {
      // 動画Idから実況情報問い合せ
      getRegisteredData(`/thread/${youtubeId}`, {threads: []});
    }
  }, [youtubeId, getRegisteredData, resetRegisteredData, sending]);

  // 実況情報更新時に設定される
  useEffect(() => {
    if (registeredData.threads.length === 0) {
      setValue("simul", false);
      setValue("simuldatetime", "");
    } else {
      setValue("simul", registeredData.simul);
      setValue("simuldatetime", registeredData.simulDatetime);
    }
  }, [registeredData, setValue]);

  // Youtube動画タイトル取得
  const [title, setTitle] = useState("");
  useEffect(() => {
    const getTitle = async () => {
      const res = await getVideoTitle(youtubeId);
      setTitle(res);
    };
    getTitle();
  }, [youtubeId]);

  return (
    <JBox>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextAreaYoutube>
          <IconButton
            disabled
          >
            <YouTubeIcon />
          </IconButton>
          <FlexTextForm
            label="Youtube URL"
            variant="standard"
            type="url"
            disabled={defaultYoutubeURL !== ""}
            // youtubeurlは必須
            {...register("youtubeurl", {
              required: true
            })}
            error={"youtubeurl" in errors}
            helperText={errors.youtubeurl?.message ?? title}
          />
        </TextAreaYoutube>
        <SimulCheckBox>
          <Controller
            name={"simul"}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                label="同時視聴"
                disabled={registeredData.threads.length > 0}
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                  />
                }
              />
            )}
          />
          {watchCheckSimul && (
            <TextField
              label="開始時間"
              type="datetime-local"
              variant="standard"
              disabled={registeredData.threads.length > 0}
              sx={{ width: 250, ml: 3 }}
              InputLabelProps={{
                shrink: true,
              }}
              {...register('simuldatetime')}
              error={"simuldatetime" in errors}
              helperText={errors.simuldatetime?.message}
            />
          )}
        </SimulCheckBox>
      </Stack>
      <Stack spacing={1} sx={{ mt: 2 }}>
        {registeredData.threads.map((thread, index) => (
          <TextArea
            key={`$registerd${index}`}
          >
            <IconButton
              disabled
            >
              <LockIcon />
            </IconButton>
            <FlexTextForm
              label={`[登録済み]実況スレ URL${index + 1}`}
              variant="standard"
              value={thread.url}
              type="url"
              disabled
              InputProps={{
                readOnly: true,
              }}
            />
          </TextArea>
        ))}
        {fields.map((field, index) => {
          return (
            <React.Fragment key={field.id}>
              <TextArea
                key={`new${index}`}
              >
                <IconButton
                  onClick={() => remove(index)}
                >
                  <ClearIcon />
                </IconButton>
                <FlexTextForm
                  label={`実況スレ URL${index + 1}`}
                  variant="standard"
                  type="url"
                  // threadurlは必須
                  {...register(`threads.${index}.url`, {
                    required: true
                  })}
                  error={"threads" in errors && errors.threads[index] !== undefined}
                  helperText={errors.threads?.[index]?.url.message}
                />
              </TextArea>
            </React.Fragment>
          )
        })}
        <Button
          disableRipple
          onClick={() => append(blankThread)}
        >
          <AddIcon />
        </Button>
        {'threads' in errors && errors.threads.message && (
          <Box
            fontSize={14}
            color="red"
          >
            {`*${errors.threads.message}`}
          </Box>
        )}
      </Stack>
      <CommitButton
        variant="contained"
        disableElevation
        onClick={handleSubmit(onSubmit)}
      >
        送信
      </CommitButton>
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
        open={sending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3000}
        open={openSnack}
        onClose={handleCloseSnack}
        message="入力が送信されました"
      />
    </JBox>
  )
});