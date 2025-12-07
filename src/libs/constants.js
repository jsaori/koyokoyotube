// 名前とチャンネルIDの紐づけ(URL管理に難あり)
// 気が向いたら改修
export const CHANNEL_ID_LIST = {
  "koyori": "UC6eWCld0KwmyHFbAqK3V-Rw",
}

// Cloud Functions URL
// 環境変数から読み込む。未設定の場合はデフォルト値を使用
export const CLOUD_FUNCTIONS_URL = process.env.REACT_APP_CLOUD_FUNCTIONS_URL || 
  "https://asia-northeast1-koyokoyotube.cloudfunctions.net";