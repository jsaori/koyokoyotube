import axios from "axios";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/";

/**
 * Youtube動画のタイトルを取得
 * RSSからではなくAPIからタイトルを取得する
 */
export const getVideoTitle = async (videoId) => {
  if (!videoId) return "";
  const req = `${YOUTUBE_API_URL}videos?part=snippet&id=${videoId}&key=${process.env.REACT_APP_FIREBASE_APIKEY}`;
  const res = await axios.get(req);
  return res.data.items[0].snippet.title;
}

/**
 * Youtube動画からコメントスレッドを取得
 */
export const getVideoCommentThreads = async (videoId) => {
  let data = {};
  data.items = [];
  let nextPage= "";
  do {
    const req = `${YOUTUBE_API_URL}commentThreads?part=snippet&videoId=${videoId}&maxResults=100&pageToken=${nextPage}&key=${process.env.REACT_APP_FIREBASE_APIKEY}`;
    const res = await axios.get(req);
    data.items = [...data.items, ...res.data.items];

    nextPage = 'nextPageToken' in res.data ? res.data.nextPageToken : "";
  } while (nextPage !== "")

  return data;
}

/**
 * Youtube動画の親コメントIDから返信コメントを20件取得
 * 100件取得すると何故かエラーが出る(仕様を見ると最大100件らしい)
 */
export const getVideoComments = async (commentId) => {
  const req = `${YOUTUBE_API_URL}comments?part=snippet&parentId=${commentId}&key=${process.env.REACT_APP_FIREBASE_APIKEY}`;
  const res = await axios.get(req);
  return res.data;
}

// タイムスタンプ投稿者メンテ
// タイムスタンプ界隈のことはよく知らないので有名所は決め打ち
// ※youtube data apiのsearchTermsでの検索は不安定なので使用しない
const author = [
  "UC15S8_2jCa0cb8eumRPBVDQ",
  "UCF2vhusCx5jy0wRlRwg3Xag",
  "UCXBxk-XPSoC9dTzNbXkTWSw"
];
export const getTimeStamp = async (videoId) => {
  // 動画から返信を含まないコメントを取得する
  const commentThread = await getVideoCommentThreads(videoId);
  let stamp = [];
  await Promise.all(commentThread.items.map(async (item) => {
    const comment = item.snippet.topLevelComment;
    // 有名所のタイムスタンプ投稿ユーザーか、コメント内に”タイムスタンプ”の文字列を含み一定の長さを有することが条件
    if ((author.includes(comment.snippet.authorChannelId.value) || comment.snippet.textDisplay.includes("タイムスタンプ")) && comment.snippet.textDisplay.length > 100) {
      // タイムスタンプ投稿者のトップレベルコメントを取得
      let commentObject = {};
      commentObject.displayName = comment.snippet.authorDisplayName;
      // タイムスタンプテキスト
      // Youtubeはコメントに含まれるhh:mm:ss(複数の亜種含む)を検出するとリンクを自動生成している
      // 対応されている亜種を考えるのは面倒なのでコメントはHTMLで取得しaタグを置き換える
      commentObject.text = comment.snippet.textDisplay;

      // タイムスタンプが複数コメントにまたがる場合トップレベルコメントに返信する形式をとる
      const comments = await getVideoComments(comment.id);
      const childComments = comments.items.concat();
      // 投稿順に並べる
      childComments.sort((a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt));
      for (let i = 0; i < childComments.length; i++) {
        if (childComments[i].snippet.authorChannelId.value === comment.snippet.authorChannelId.value) {
          // コメントとコメントのつなぎは改行
          commentObject.text += `<br>${childComments[i].snippet.textDisplay}`;
        }
      }
      stamp.push(commentObject);
    }
  }));
  return stamp;
}