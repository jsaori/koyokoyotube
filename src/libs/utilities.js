/**
 * (HH:)mm:ss形式文字列を秒に変換する関数
 */
export const TimeToSeconds = (time) => {
  if (!time) return 0;
  const data = time.split(":");
  let seconds = 0;
  for (let i = 0; i < data.length; i++) {
    seconds += Number(data[data.length - i - 1]) * (60 ** i);
  }
  return seconds;
}

/**
 * 動画ソート関数を生成する
 * @param {string} sort - ソートタイプ ("publishDesc", "publishAsc", "durationDesc", "durationAsc", "titleDesc", "titleAsc")
 * @returns {Function} ソート比較関数
 */
export const createSortFunction = (sort) => {
  return (prev, current) => {
    let comparison = 0;
    if (sort === "publishDesc") {
      comparison = new Date(current.publishedAt) - new Date(prev.publishedAt);
    } else if (sort === "publishAsc") {
      comparison = new Date(prev.publishedAt) - new Date(current.publishedAt);
    } else if (sort === "durationDesc") {
      comparison = Number(current.duration) - Number(prev.duration);
    } else if (sort === "durationAsc") {
      comparison = Number(prev.duration) - Number(current.duration);
    } else if (sort === "titleDesc") {
      comparison = current.title < prev.title ? 1 : -1;
    } else if (sort === "titleAsc") {
      comparison = prev.title < current.title ? 1 : -1;
    } else {
      comparison = 0;
    }
    return comparison;
  };
}