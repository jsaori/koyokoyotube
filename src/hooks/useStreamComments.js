import { useCallback, useRef, useState } from "react";

const DURATION_SECONDS = 5;
const MAX_COMMENT_LINES = 11;
const MAX_COMMENT_LENGTH = 75;
const MAX_DISPLAY_CHARS = 27;
const MAX_COMMENTS = 50;
const SEEK_THRESHOLD_MS = 200;

const LANE_DATA_INIT = Array(11).fill(null).map(() => ({ time: 0, length: 0 }));

/**
 * コメントの行数と最大文字数を計算
 */
const calculateCommentMetrics = (text) => {
  const lines = text.split(/\n/);
  const commentline = lines.length;
  const commentlength = Math.max(...lines.map(line => line.length));
  return { commentline, commentlength };
};

/**
 * コメントが制限内かチェック
 */
const isCommentValid = (commentline, commentlength) => {
  return commentline <= MAX_COMMENT_LINES && commentlength <= MAX_COMMENT_LENGTH;
};

/**
 * レーンIDを計算する
 */
const calculateLane = (commentline, commentlength, prevCommentLane, currentMS) => {
  let lane = -1;
  let lineCheck = 0;
  
  for (let i = 0; i < 11; i++) {
    const diffMS = currentMS - prevCommentLane[i].time;
    const isLaneEmpty = prevCommentLane[i].length === 0 || diffMS >= (DURATION_SECONDS * 1000);
    
    if (isLaneEmpty) {
      lineCheck++;
      if (commentline === lineCheck) {
        lane = i - commentline + 1;
        break;
      }
      continue;
    }

    // 入り口が空いているかチェック
    const entranceClear = (MAX_DISPLAY_CHARS + prevCommentLane[i].length) * diffMS / (DURATION_SECONDS * 1000) >= prevCommentLane[i].length;
    
    if (entranceClear) {
      if (prevCommentLane[i].length >= commentlength) {
        // 前のコメント長の方が長いので追いつかない
        lineCheck++;
        if (commentline === lineCheck) {
          lane = i - commentline + 1;
          break;
        }
        continue;
      } else if ((MAX_DISPLAY_CHARS + commentlength) * ((DURATION_SECONDS * 1000) - diffMS) / (DURATION_SECONDS * 1000) <= MAX_DISPLAY_CHARS) {
        // 前のコメントが画面端に到達するまでに追いつかない
        lineCheck++;
        if (commentline === lineCheck) {
          lane = i - commentline + 1;
          break;
        }
        continue;
      }
      // 追いつくのでループ続行
    }
    // continueしない場合に連続空き行カウント初期化
    lineCheck = 0;
  }

  if (lane === -1 || commentline !== lineCheck) {
    // 配置する場所がないコメントはランダムな場所に流す
    lane = Math.floor(Math.random() * (11 - commentline + 1));
  }

  return lane;
};

/**
 * 動画上流れるコメントを管理するHOOK
 * @param {Object} thread - 実況スレッドデータ
 * @returns {Object} { commentNo, comments, setStreamComments, resetStreamComments }
 */
export function useStreamComments(thread) {
  // 動画上流れるコメント
  const [comments, setComments] = useState([]);
  // 前回処理時間(ms)
  const [prevMS, setPrevMS] = useState(0);
  // 動画上のレーン管理
  const [commentLane, setCommentLane] = useState(LANE_DATA_INIT);
  // 現在流れているコメントNo
  const [commentNo, setCommentNo] = useState(0);
  // 既に処理したコメントIDを追跡（重複防止）
  const processedCommentIds = useRef(new Set());

  // コメントクリア処理
  const resetStreamComments = useCallback(() => {
    setComments([]);
    setCommentLane(LANE_DATA_INIT);
    setPrevMS(0);
    setCommentNo(0);
    processedCommentIds.current.clear();
  }, []);

  // 動画経過時間から動画に流すコメントを決定する
  const setStreamComments = useCallback((currentMS) => {
    // 実況スレがなければ何もしない
    if (!thread?.data?.comments) return;

    // 前回と閾値以上差があればシーク判定
    if (Math.abs(prevMS - currentMS) > SEEK_THRESHOLD_MS) {
      // シーク時は時刻だけ設定して初期化
      setComments([]);
      setCommentLane(LANE_DATA_INIT);
      setPrevMS(currentMS);
      processedCommentIds.current.clear();
      return;
    }

    // 前回~現在までのコメントをフィルタリング
    const commentsToProcess = thread.data.comments.filter(comment => {
      const posMs = Number(comment.posMs);
      return prevMS <= posMs && posMs < currentMS;
    });

    if (commentsToProcess.length === 0) {
      setPrevMS(currentMS);
      return;
    }

    // 現在のコメントレーン状態をコピー
    let updatedCommentLane = [...commentLane];
    const newComments = [];

    commentsToProcess.forEach((comment, index) => {
      const text = comment.body;
      const commentId = `${comment.no}:${comment.thread}`;
      
      // 重複チェック（既に処理済みのコメントはスキップ）
      if (processedCommentIds.current.has(commentId)) {
        return;
      }

      // コメントのメトリクスを計算
      const { commentline, commentlength } = calculateCommentMetrics(text);

      // コメント制限チェック
      if (!isCommentValid(commentline, commentlength)) {
        return;
      }

      // レーンIDを計算
      const lane = calculateLane(commentline, commentlength, updatedCommentLane, currentMS);

      // コメントNo更新（コメントのインデックスを直接使用）
      const commentIndex = thread.data.comments.indexOf(comment);
      if (commentIndex !== -1) {
        setCommentNo(commentIndex);
      }

      // 新しいコメントを追加
      newComments.push({
        lane,
        id: commentId,
        text,
        line: commentline
      });

      // 処理済みIDを記録
      processedCommentIds.current.add(commentId);

      // コメントレーンを更新
      updatedCommentLane = updatedCommentLane.map((laneTime, i) => {
        return (lane <= i && i <= lane + commentline - 1)
          ? { time: currentMS, length: commentlength }
          : laneTime;
      });
    });

    // コメントを一括で追加（関数型更新を使用して依存配列からcommentsを削除）
    if (newComments.length > 0) {
      setComments((prevComments) => {
        const updated = [...prevComments, ...newComments];
        // コメント数が上限を超えた場合は古いものを削除
        return updated.length > MAX_COMMENTS
          ? updated.slice(updated.length - MAX_COMMENTS)
          : updated;
      });
    }

    // コメントレーンを更新
    setCommentLane(updatedCommentLane);
    setPrevMS(currentMS);
  }, [thread, prevMS, commentLane]);

  return {
    commentNo,
    comments,
    setStreamComments,
    resetStreamComments
  };
}