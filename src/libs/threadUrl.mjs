// 登録できる閲覧用URL。取得先・リダイレクト先はFunctionsでも検証する。
export function isThreadUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.port || url.search || url.hash) return false;

  // スレ番号以降のレス範囲（l50、1-100、574-等）は各掲示板で共通。
  const match = /^(.*\/)(\d{10})(?:\/(?:l\d+|\d+(?:-\d*)?|-\d+))?\/?$/.exec(url.pathname);
  if (!match) return false;
  const boardPath = match[1];
  if (/^(eagle|fate|swallow|tanuki|itest)\.5ch\.(net|io)$/.test(url.hostname)) {
    return /^\/(?:[a-z]+\/)?test\/read\.cgi\/(?:c\/)?[a-z0-9_]+\/$/.test(boardPath);
  }
  if (url.hostname === "jbbs.shitaraba.net") {
    return /^\/bbs\/(?:read|read_archive|rawmode)\.cgi\/[a-z0-9_]+\/25835\/$/.test(boardPath);
  }
  return url.hostname === "bbs.jpnkn.com" &&
    /^\/test\/read\.cgi\/hkikyr\/$/.test(boardPath);
}
