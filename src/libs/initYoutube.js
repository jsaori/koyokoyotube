import axios from "axios";

const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/";

/**
 * YouTube APIへのリクエストを実行
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} params - クエリパラメータ
 * @returns {Promise<Object>} APIレスポンス
 */
const makeYouTubeApiRequest = async (endpoint, params = {}) => {
  try {
    const apiKey = process.env.REACT_APP_FIREBASE_APIKEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not configured');
    }

    const queryParams = new URLSearchParams({
      ...params,
      key: apiKey
    });
    const url = `${YOUTUBE_API_URL}${endpoint}?${queryParams.toString()}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`YouTube API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Youtube動画のタイトルを取得
 * APIキー不要のNoembedサービスを使用してタイトルを取得する
 * @param {string} videoId - 動画ID
 * @returns {Promise<string>} 動画タイトル
 */
export const getVideoTitle = async (videoId) => {
  if (!videoId) return "";
  try {
    const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(url);
    return response.data.title || "";
  } catch (error) {
    console.error('Failed to get video title:', error);
    return "";
  }
};

/**
 * Youtube動画のチャンネルIDを取得
 * @param {string} videoId - 動画ID
 * @returns {Promise<string>} チャンネルID
 */
export const getChannelId = async (videoId) => {
  if (!videoId) return "";
  try {
    const data = await makeYouTubeApiRequest('videos', {
      part: 'snippet',
      id: videoId
    });
    return data.items?.[0]?.snippet?.channelId || "";
  } catch (error) {
    console.error('Failed to get channel ID:', error);
    return "";
  }
};

/**
 * Youtube動画からコメントスレッドを取得
 * @param {string} videoId - 動画ID
 * @returns {Promise<Object>} コメントスレッドデータ
 */
export const getVideoCommentThreads = async (videoId) => {
  if (!videoId) {
    return { items: [] };
  }

  try {
    const allItems = [];
    let nextPageToken = "";

    do {
      const params = {
        part: 'snippet',
        videoId: videoId,
        maxResults: 100
      };
      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }

      const data = await makeYouTubeApiRequest('commentThreads', params);
      allItems.push(...(data.items || []));
      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken !== "");

    return { items: allItems };
  } catch (error) {
    console.error('Failed to get video comment threads:', error);
    return { items: [] };
  }
};

/**
 * Youtube動画の親コメントIDから返信コメントを取得
 * 100件取得すると何故かエラーが出る(仕様を見ると最大100件らしい)
 * @param {string} commentId - 親コメントID
 * @returns {Promise<Object>} 返信コメントデータ
 */
export const getVideoComments = async (commentId) => {
  if (!commentId) {
    return { items: [] };
  }

  try {
    const data = await makeYouTubeApiRequest('comments', {
      part: 'snippet',
      parentId: commentId,
      maxResults: 20
    });
    return data;
  } catch (error) {
    console.error('Failed to get video comments:', error);
    return { items: [] };
  }
};

// タイムスタンプ投稿者メンテ
// タイムスタンプ界隈のことはよく知らないので有名所は決め打ち
// ※youtube data apiのsearchTermsでの検索は不安定なので使用しない
const TIMESTAMP_AUTHORS = [
  "UC15S8_2jCa0cb8eumRPBVDQ",
  "UCF2vhusCx5jy0wRlRwg3Xag",
  "UCXBxk-XPSoC9dTzNbXkTWSw"
];
const MIN_TIMESTAMP_COMMENT_LENGTH = 100;

/**
 * コメントがタイムスタンプ投稿かどうかを判定
 * @param {Object} comment - コメントオブジェクト
 * @returns {boolean} タイムスタンプ投稿かどうか
 */
const isTimestampComment = (comment) => {
  if (!comment?.snippet) return false;
  
  const authorId = comment.snippet.authorChannelId?.value;
  const textDisplay = comment.snippet.textDisplay || "";
  
  const isKnownAuthor = TIMESTAMP_AUTHORS.includes(authorId);
  const hasTimestampKeyword = textDisplay.includes("タイムスタンプ");
  const isLongEnough = textDisplay.length > MIN_TIMESTAMP_COMMENT_LENGTH;
  
  return (isKnownAuthor || hasTimestampKeyword) && isLongEnough;
};

/**
 * タイムスタンプコメントオブジェクトを構築
 * @param {Object} topLevelComment - トップレベルコメント
 * @param {Array} childComments - 子コメント配列
 * @returns {Object} タイムスタンプコメントオブジェクト
 */
const buildTimestampComment = (topLevelComment, childComments) => {
  const commentObject = {
    displayName: topLevelComment.snippet.authorDisplayName,
    text: topLevelComment.snippet.textDisplay
  };

  // タイムスタンプが複数コメントにまたがる場合トップレベルコメントに返信する形式をとる
  // 投稿順に並べる
  const sortedChildComments = [...childComments].sort(
    (a, b) => new Date(a.snippet.publishedAt) - new Date(b.snippet.publishedAt)
  );

  const authorId = topLevelComment.snippet.authorChannelId?.value;
  sortedChildComments.forEach((childComment) => {
    if (childComment.snippet.authorChannelId?.value === authorId) {
      // コメントとコメントのつなぎは改行
      commentObject.text += `<br>${childComment.snippet.textDisplay}`;
    }
  });

  return commentObject;
};

/**
 * 動画からタイムスタンプコメントを取得
 * Youtubeはコメントに含まれるhh:mm:ss(複数の亜種含む)を検出するとリンクを自動生成している
 * 対応されている亜種を考えるのは面倒なのでコメントはHTMLで取得しaタグを置き換える
 * @param {string} videoId - 動画ID
 * @returns {Promise<Array>} タイムスタンプコメントの配列
 */
export const getTimeStamp = async (videoId) => {
  if (!videoId) {
    return [];
  }

  try {
    // 動画から返信を含まないコメントを取得する
    const commentThread = await getVideoCommentThreads(videoId);
    
    if (!commentThread.items || commentThread.items.length === 0) {
      return [];
    }

    // タイムスタンプコメントを処理
    const timestampPromises = commentThread.items
      .filter((item) => {
        const comment = item.snippet?.topLevelComment;
        return comment && isTimestampComment(comment);
      })
      .map(async (item) => {
        const topLevelComment = item.snippet.topLevelComment;
        
        try {
          // 返信コメントを取得
          const comments = await getVideoComments(topLevelComment.id);
          const childComments = comments.items || [];
          
          return buildTimestampComment(topLevelComment, childComments);
        } catch (error) {
          console.error('Failed to process timestamp comment:', error);
          return null;
        }
      });

    const timestamps = await Promise.all(timestampPromises);
    return timestamps.filter(ts => ts !== null);
  } catch (error) {
    console.error('Failed to get timestamp:', error);
    return [];
  }
};
