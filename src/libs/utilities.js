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