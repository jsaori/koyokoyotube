import React, { memo, useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Backdrop, Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, Snackbar, Stack, TextField } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Controller, useFieldArray, useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup'

import { useGetRealtimeDB, useUpdateRealtimeDB } from "../../hooks/useRealtimeDB";
import { getVideoTitle, getChannelId } from "../../libs/initYoutube";
import { FormCommitButton } from "../shared/StyledComponents";

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

const CommitButton = FormCommitButton;
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
    // 編集されたスレッドを取得（削除されていないもの）
    const editedThreads = Array.from(editedThreadsMap.entries())
      .filter(([index]) => !deletedThreadIndices.has(index))
      .map(([_, t]) => t.url);
    // 編集されていない、かつ削除されていない登録済みスレッドを取得
    const uneditedRegisteredThreads = registeredData.threads
      .filter((_, index) => !editedThreadsMap.has(index) && !deletedThreadIndices.has(index))
      .map(t => t.url);
    // スラッシュを全て抜いた文字列で比較を行う
    const data = [...uneditedRegisteredThreads, ...editedThreads, ...watchThreads.filter(v => v.url.replace(/\//g, '') !== thread.replace(/\//g, ''))];
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
            .matches(/((5ch.net).+\/([0-9]{10})|((shitaraba.net).+\/25835\/([0-9]{10}))|((bbs.jpnkn.com).+\/hkikyr\/([0-9]{10})))($|\/)/, { message: "URLが不正です"})
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

  // 編集状態管理
  const [editableThreadIndices, setEditableThreadIndices] = useState(new Set());
  const [editedThreadsMap, setEditedThreadsMap] = useState(new Map());
  // 削除状態管理
  const [deletedThreadIndices, setDeletedThreadIndices] = useState(new Set());

  // フォーム送信処理
  const [sending, updateThreadData] = useUpdateRealtimeDB();
  const [openSnack, setOpenSnack] = useState(false);
  const onSubmit = (data) => {
    // 編集されたスレッドのバリデーション
    const threadPattern = /((5ch.net).+\/([0-9]{10})|((shitaraba.net).+\/25835\/([0-9]{10}))|((bbs.jpnkn.com).+\/hkikyr\/([0-9]{10})))($|\/)/;
    for (const [index, thread] of editedThreadsMap.entries()) {
      const url = thread.url;
      if (!url || !threadPattern.test(url)) {
        // バリデーションエラーがある場合は送信を阻止
        setOpenSnack(true);
        // エラーメッセージを表示するためにSnackbarを更新（後で改善可能）
        return;
      }
    }

    const json = {};
    json.simul = data.simul ?? false;
    json.simulDatetime = data.simul ? data.simuldatetime : "";

    // 削除されていない、かつ編集されていないスレッド（そのまま保持）
    const uneditedThreads = registeredData.threads.filter((_, index) => 
      !deletedThreadIndices.has(index) && !editedThreadsMap.has(index)
    );

    // 編集されたスレッド（削除されていないもの、URLのみ更新）
    const editedThreads = Array.from(editedThreadsMap.entries())
      .filter(([index]) => !deletedThreadIndices.has(index))
      .map(([index, thread]) => {
        const originalThread = registeredData.threads[index];
        return {
          url: thread.url,
          // cacheフラグは既存の値を保持（koyokoyoactionsで使われないため考慮不要）
          ...(originalThread.cache !== undefined && { cache: originalThread.cache })
        };
      });

    // 新規追加スレッド
    const newThreads = data.threads;

    json.threads = [...uneditedThreads, ...editedThreads, ...newThreads];
    
    // 削除・編集または新規追加がある場合のみupdate: trueに設定
    const hasChanges = deletedThreadIndices.size > 0 || editedThreads.length > 0 || newThreads.length > 0;
    if (hasChanges) {
      json.update = true;
    }
    
    json.channelId = channelId;
    updateThreadData(`/thread/${youtubeId}`, json);
    
    // 送信後フォームのリセットを行う
    reset({
      youtubeurl: defaultYoutubeURL,
      simuldatetime: "",
      threads: [blankThread]
    });

    // 編集状態もリセット
    setEditableThreadIndices(new Set());
    setEditedThreadsMap(new Map());
    setDeletedThreadIndices(new Set());

    setOpenSnack(true);
  };

  const handleCloseSnack = () => {
    setOpenSnack(false);
  };

  // 編集モードの切り替え
  const handleToggleEdit = (index) => {
    setEditableThreadIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
        // 編集モードを解除する際、変更がなければeditedThreadsMapからも削除
        setEditedThreadsMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(index);
          return newMap;
        });
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 編集されたスレッドのURLを更新
  const handleEditedThreadChange = (index, newUrl) => {
    setEditedThreadsMap(prev => {
      const newMap = new Map(prev);
      const originalThread = registeredData.threads[index];
      if (newUrl !== originalThread.url) {
        newMap.set(index, { url: newUrl });
      } else {
        newMap.delete(index);
      }
      return newMap;
    });
  };

  // 削除モードの切り替え
  const handleToggleDelete = (index) => {
    setDeletedThreadIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        // 削除時は編集モードも解除
        setEditableThreadIndices(prevEdit => {
          const newEditSet = new Set(prevEdit);
          newEditSet.delete(index);
          return newEditSet;
        });
        // 編集状態もクリア
        setEditedThreadsMap(prevMap => {
          const newMap = new Map(prevMap);
          newMap.delete(index);
          return newMap;
        });
      }
      return newSet;
    });
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
    // registeredDataが変更されたら編集状態をリセット
    setEditableThreadIndices(new Set());
    setEditedThreadsMap(new Map());
    setDeletedThreadIndices(new Set());
  }, [registeredData, setValue]);

  // Youtube動画タイトル取得
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (!youtubeId) return;
    const getTitle = async () => {
      try {
        const res = await getVideoTitle(youtubeId);
        setTitle(res);
      } catch (error) {
        console.error(`Failed to get video title for ${youtubeId}:`, error);
        setTitle("");
      }
    };
    getTitle();
  }, [youtubeId]);

  // Youtube動画に紐付くチャンネルID取得
  const [channelId, setChannelId] = useState("");
  useEffect(() => {
    if (!youtubeId) return;
    const getChannelIdFunc = async() => {
      try {
        const res = await getChannelId(youtubeId);
        setChannelId(res);
      } catch (error) {
        console.error(`Failed to get channel ID for ${youtubeId}:`, error);
        setChannelId("");
      }
    };
    getChannelIdFunc();
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
        {registeredData.threads.map((thread, index) => {
          const isEditable = editableThreadIndices.has(index);
          const isDeleted = deletedThreadIndices.has(index);
          const editedThread = editedThreadsMap.get(index);
          const displayUrl = editedThread ? editedThread.url : thread.url;
          return (
            <TextArea
              key={`registered-${thread.url}-${index}`}
            >
              <IconButton
                onClick={() => handleToggleEdit(index)}
                disabled={isDeleted}
              >
                {isEditable ? <LockOpenIcon /> : <LockIcon />}
              </IconButton>
              <FlexTextForm
                label={`[登録済み]実況スレ URL${index + 1}`}
                variant="standard"
                value={displayUrl}
                type="url"
                disabled={!isEditable || isDeleted}
                InputProps={{
                  readOnly: !isEditable || isDeleted,
                }}
                sx={{
                  ...(isDeleted && {
                    textDecoration: 'line-through',
                    opacity: 0.5,
                  }),
                }}
                onChange={(e) => {
                  if (isEditable && !isDeleted) {
                    handleEditedThreadChange(index, e.target.value);
                  }
                }}
                error={isEditable && editedThread && (() => {
                  // バリデーション: URL形式チェック
                  const urlPattern = /^https?:\/\/.+/;
                  if (!urlPattern.test(displayUrl) && displayUrl !== "") {
                    return true;
                  }
                  // 実況スレURL形式チェック
                  const threadPattern = /((5ch.net).+\/([0-9]{10})|((shitaraba.net).+\/25835\/([0-9]{10}))|((bbs.jpnkn.com).+\/hkikyr\/([0-9]{10})))($|\/)/;
                  if (displayUrl !== "" && !threadPattern.test(displayUrl)) {
                    return true;
                  }
                  // 重複チェック
                  const normalizedUrl = displayUrl.replace(/\//g, '');
                  // 他の編集されたスレッドと重複チェック
                  for (const [otherIndex, otherThread] of editedThreadsMap.entries()) {
                    if (otherIndex !== index && otherThread.url.replace(/\//g, '') === normalizedUrl) {
                      return true;
                    }
                  }
                  // 未編集の登録済みスレッドと重複チェック（削除されていないもの）
                  for (let i = 0; i < registeredData.threads.length; i++) {
                    if (i !== index && !editedThreadsMap.has(i) && !deletedThreadIndices.has(i)) {
                      if (registeredData.threads[i].url.replace(/\//g, '') === normalizedUrl) {
                        return true;
                      }
                    }
                  }
                  // 新規スレッドと重複チェック
                  for (const newThread of watchThreads) {
                    if (newThread.url.replace(/\//g, '') === normalizedUrl) {
                      return true;
                    }
                  }
                  return false;
                })()}
                helperText={isEditable && editedThread && (() => {
                  const urlPattern = /^https?:\/\/.+/;
                  if (!urlPattern.test(displayUrl) && displayUrl !== "") {
                    return "URLが不正です";
                  }
                  const threadPattern = /((5ch.net).+\/([0-9]{10})|((shitaraba.net).+\/25835\/([0-9]{10}))|((bbs.jpnkn.com).+\/hkikyr\/([0-9]{10})))($|\/)/;
                  if (displayUrl !== "" && !threadPattern.test(displayUrl)) {
                    return "URLが不正です";
                  }
                  // 重複チェック
                  const normalizedUrl = displayUrl.replace(/\//g, '');
                  // 他の編集されたスレッドと重複チェック
                  for (const [otherIndex, otherThread] of editedThreadsMap.entries()) {
                    if (otherIndex !== index && otherThread.url.replace(/\//g, '') === normalizedUrl) {
                      return "実況スレURLが重複しています";
                    }
                  }
                  // 未編集の登録済みスレッドと重複チェック（削除されていないもの）
                  for (let i = 0; i < registeredData.threads.length; i++) {
                    if (i !== index && !editedThreadsMap.has(i) && !deletedThreadIndices.has(i)) {
                      if (registeredData.threads[i].url.replace(/\//g, '') === normalizedUrl) {
                        return "実況スレURLが重複しています";
                      }
                    }
                  }
                  // 新規スレッドと重複チェック
                  for (const newThread of watchThreads) {
                    if (newThread.url.replace(/\//g, '') === normalizedUrl) {
                      return "実況スレURLが重複しています";
                    }
                  }
                  return "";
                })()}
              />
              <IconButton
                onClick={() => handleToggleDelete(index)}
                color={isDeleted ? "error" : "default"}
              >
                <DeleteIcon />
              </IconButton>
            </TextArea>
          );
        })}
        {fields.map((field, index) => {
          // 登録済みスレッドの数を取得して連番にする
          const threadNumber = registeredData.threads.length + index + 1;
          return (
            <React.Fragment key={field.id}>
              <TextArea
                key={field.id}
              >
                <IconButton
                  onClick={() => remove(index)}
                >
                  <ClearIcon />
                </IconButton>
                <FlexTextForm
                  label={`実況スレ URL${threadNumber}`}
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