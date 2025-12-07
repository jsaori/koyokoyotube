import axios from "axios";
import { CLOUD_FUNCTIONS_URL } from "./constants";

/**
 * Cloud FunctionsのHTTPエンドポイントを呼び出す（リトライ付き）
 * @param {string} videoId - YouTube動画ID
 * @param {number} maxRetries - 最大リトライ回数（デフォルト: 3）
 * @param {number} retryDelay - リトライ間隔（ミリ秒、デフォルト: 1000）
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const triggerProcessComments = async (videoId, maxRetries = 3, retryDelay = 1000) => {
  const endpoint = `${CLOUD_FUNCTIONS_URL}/triggerProcessComments`;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(endpoint, { videoId }, {
        timeout: 30000, // 30秒タイムアウト
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        console.log(`Successfully triggered processComments for video: ${videoId}`);
        return {
          success: true,
          message: response.data.message || "Processing started",
        };
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      
      if (error.response) {
        // HTTPエラーレスポンス
        const status = error.response.status;
        const errorMessage = error.response.data?.error || error.message;
        
        // 4xxエラー（クライアントエラー）はリトライしない
        if (status >= 400 && status < 500) {
          console.error(`Client error when triggering processComments: ${status} - ${errorMessage}`);
          throw new Error(`Failed to trigger processComments: ${errorMessage}`);
        }
        
        // 5xxエラー（サーバーエラー）はリトライする
        if (isLastAttempt) {
          console.error(`Server error when triggering processComments after ${maxRetries} retries: ${status} - ${errorMessage}`);
          throw new Error(`Failed to trigger processComments after ${maxRetries} retries: ${errorMessage}`);
        }
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない（ネットワークエラーなど）
        if (isLastAttempt) {
          console.error(`Network error when triggering processComments after ${maxRetries} retries:`, error.message);
          throw new Error(`Network error: ${error.message}`);
        }
      } else {
        // その他のエラー
        console.error(`Error when triggering processComments:`, error.message);
        throw error;
      }

      // リトライ前に待機（指数バックオフ）
      if (!isLastAttempt) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`Retrying triggerProcessComments (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // この行には到達しないはずだが、TypeScriptの型チェックのために追加
  throw new Error("Unexpected end of retry loop");
};
