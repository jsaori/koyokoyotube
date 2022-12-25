import { useCallback, useState } from "react";

const DURATION_SECONDS = 5;
const LANE_DATA_INIT =
  [{time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0},
   {time: 0, length: 0}];

/**
 * 動画上流れるコメントを管理するHOOK
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

  // コメントクリア処理
  const resetStreamComments = useCallback(() => {
    setComments([]);
    setCommentLane(LANE_DATA_INIT);
    setPrevMS(0);
  }, []);

  // 動画経過時間から動画に流すコメントを決定する
  const setStreamComments = useCallback((currentMS) => {
    // 実況スレがなければ何もしない
    if (!thread) return;;

    // 前回と0.1秒以上差があればシーク判定
    if (Math.abs(prevMS - currentMS) > 200) {
      // シーク時は時刻だけ設定して初期化
      setComments([]);
      setCommentLane(LANE_DATA_INIT);
      setPrevMS(currentMS);
      return;
    }

    // 前回~現在までのコメントを登録
    let prevCommentLane = commentLane.concat();
    thread.data.comments.filter(comment => prevMS <= Number(comment.posMs) && Number(comment.posMs) < currentMS).forEach((comment) => {
      // コメントNo更新
      setCommentNo(thread.data.comments.indexOf(comment));

      // コメントテキスト
      const text = comment.body;
      // コメント一意識別子
      const commentId = `${comment.no}:${comment.thread}`;
      if (comments.find(data => data.id === commentId)) {
        // 再生・停止を繰り返すとprevMS > currentMSとなることがある
        // このときコメントが重複登録されidが重複するので検出して弾く
        return;
      }
      // コメント行数
      const commentline = (text.match(/\n/g) || []).length + 1;
      // コメント行内最大文字数
      const commentlength = text.split(/\n/).reduce((prev, current) => {
        return prev.length > current.length ? prev : current;
      }).length;

      // コメント制限
      if (commentline > 11 || commentlength > 75) {
        setPrevMS(currentMS);
        return;
      }

      // レーンIDの振り分けを行う
      let lane = -1;
      let lineCheck = 0;
      for (let i = 0; i < 11; i++) {
        // 初回および前回から(durationSeconds * 1000)(ms)経過したレーンは空き状態
        const diffMS = currentMS - prevCommentLane[i].time;
        if (prevCommentLane[i].length === 0 || diffMS >=  (DURATION_SECONDS * 1000)) {
          lineCheck++;
          if (commentline === lineCheck) {
            lane = i - commentline + 1;
            break;
          } else {
            continue;
          }
        }

        // 画面への日本語最大表示は27文字(アルファベットは50字だが考慮しない)
        // DURATION_SECONDS * 1000(ms) : 27 + prevCommentLane[i].length = diffMS : x
        // x >= prevCommentLane[i].lengthであればコメントレーンの入り口は空いている
        // prevCommentLane[i].length >= text.lengthなら追いつくことはない
        // prevCommentLane[i].length < text.lengthなら追いつく可能性有
        // DURATION_SECONDS * 1000 : 27 + text.length = DURATION_SECONDS * 1000 - diffMS : y
        // y > 27であれば追いつく
        //
        // 更にコメント行数の概念を追加する
        // 上の式で判定される連続した表示可能行数をlineCheckにて管理する
        // lineCheckとコメント行数が一致すればそこにコメントを表示する
        if ((27 + prevCommentLane[i].length) * diffMS / (DURATION_SECONDS * 1000) >= prevCommentLane[i].length) {
          // 入り口が空
          if (prevCommentLane[i].length >= commentlength) {
            // 前のコメント長の方が長いので追いつかない
            lineCheck++;
            if (commentline === lineCheck) {
              lane = i - commentline + 1;
              break;
            } else {
              continue;
            }
          } else if ((27 + commentlength) * ((DURATION_SECONDS * 1000) - diffMS) / (DURATION_SECONDS * 1000) <= 27) {
            // 前のコメントが画面端に到達するまでに追いつかない
            lineCheck++;
            if (commentline === lineCheck) {
              lane = i - commentline + 1;
              break;
            } else {
              continue;
            }
          } else {
            // 追いつくのでループ続行
          }
        }
        // continueしない場合に連続空き行カウント初期化
        lineCheck = 0;
      }

      if (lane === -1 || commentline !== lineCheck) {
        // 配置する場所がないコメントはランダムな場所に流す
        lane = Math.random() * (10 - commentline + 1);
      }

      // コメントおよび次回処理時に使用するコメントレーン設定を更新
      setComments((comments) => [...comments, {lane: lane, id: commentId, text: text, line: commentline}]);
      prevCommentLane = prevCommentLane.map((laneTime, index) => {
        return (
          (lane <= index && index <= lane + commentline - 1) ? {time: currentMS, length: commentlength} : laneTime
        )
      });
      setCommentLane(prevCommentLane);
    });

    if (comments.length > 50) {
      setComments((comments) => [...comments.slice(comments.length - 50, comments.length)]);
    }
    setPrevMS(currentMS);

  }, [thread, prevMS, commentLane, comments]);

  return ({
    commentNo: commentNo,
    comments: comments,
    setStreamComments: setStreamComments,
    resetStreamComments: resetStreamComments
  });
}