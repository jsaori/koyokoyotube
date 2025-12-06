/**
 * (HH:)mm:ss形式文字列を秒に変換する関数
 * @param {string} time - 時間文字列 (例: "1:23:45" または "23:45")
 * @returns {number} 秒数
 */
export const TimeToSeconds = (time) => {
  if (!time) return 0;
  return time.split(":")
    .reverse()
    .reduce((seconds, part, index) => seconds + Number(part) * (60 ** index), 0);
}

/**
 * 動画ソート関数を生成する
 * @param {string} sort - ソートタイプ ("publishDesc", "publishAsc", "durationDesc", "durationAsc", "titleDesc", "titleAsc")
 * @returns {Function} ソート比較関数
 */
export const createSortFunction = (sort) => {
  const sortStrategies = {
    publishDesc: (prev, current) => new Date(current.publishedAt) - new Date(prev.publishedAt),
    publishAsc: (prev, current) => new Date(prev.publishedAt) - new Date(current.publishedAt),
    durationDesc: (prev, current) => Number(current.duration) - Number(prev.duration),
    durationAsc: (prev, current) => Number(prev.duration) - Number(current.duration),
    titleDesc: (prev, current) => current.title < prev.title ? 1 : -1,
    titleAsc: (prev, current) => prev.title < current.title ? 1 : -1,
  };

  const strategy = sortStrategies[sort];
  return strategy || (() => 0);
}