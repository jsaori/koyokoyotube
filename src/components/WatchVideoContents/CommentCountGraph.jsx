import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';
import { WatchVideoMainPlayerLayer } from "./WatchVideoPlayer.styles";

const SEEK_BAR_MARGIN = 12;

/**
 * コメント数グラフのデータを計算するカスタムフック
 */
export const useCommentCountGraph = (thread, bounds, videoLength, isMobile, graphDisp) => {
  const [commentsCount, setCommentsCount] = useState([]);

  useEffect(() => {
    if (!isMobile && graphDisp && thread && bounds && videoLength > 0) {
      // 動画再生時間を超えたコメントは切り捨てる
      const filteredComments = thread.data.comments.filter(c => c.posMs / 1000 <= videoLength);

      // インターバル数はシークバーの width に揃える
      const intervalCount = bounds.width - SEEK_BAR_MARGIN * 2;

      // インターバルは再生時間をインターバル数で分割する
      const interval = videoLength / intervalCount;

      // インターバルの配列を生成
      const intervals = Array.from({length: Math.ceil(videoLength / interval)}, (_, i) => i * interval);

      // インターバルごとにコメント数を算出する
      const commentsCount = intervals.map(intervalStart => {
        return {
          time: intervalStart,
          count: filteredComments.filter(c => c.posMs / 1000 >= intervalStart && c.posMs / 1000 < intervalStart + interval).length
        }
      });
      setCommentsCount(commentsCount);
    } else {
      setCommentsCount([]);
    }
  }, [thread, bounds, videoLength, isMobile, graphDisp]);

  return commentsCount;
};

/**
 * コメント数グラフコンポーネント（デスクトップのみ）
 */
export const CommentCountGraph = ({ bounds, commentsCount, isMobile, graphDisp }) => {
  if (!isMobile && graphDisp && bounds) {
    return (
      <WatchVideoMainPlayerLayer
        zIndex={2}
        sx={{
          pointerEvents: "none"
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={bounds.width - SEEK_BAR_MARGIN * 2}
            height={bounds.height}
            data={commentsCount}
            margin={{top: bounds.height * 3 / 4, bottom: 45, left: SEEK_BAR_MARGIN, right: SEEK_BAR_MARGIN}}
          >
            <XAxis dataKey="time" hide={true} />
            <Area type="monotone" dataKey="count" stroke="#ffacd3" fill="#ffacd3" />
          </AreaChart>
        </ResponsiveContainer>
      </WatchVideoMainPlayerLayer>
    );
  }
  return null;
};

