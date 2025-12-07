---
name: koyokoyofunctions新規プロジェクト構築
overview: 既存のkoyokoyoactionsを保持しつつ、新規プロジェクトkoyokoyofunctionsでCloud Functions用のモジュールを再構築する。イベント駆動型アーキテクチャを実装し、Vision APIによる自動フィルタリング、Firestoreへの画像登録、Pub/Subトリガーを実装する。
todos:
  - id: setup-new-project
    content: koyokoyofunctionsプロジェクトの初期化（firebase init functions）
    status: pending
  - id: setup-dependencies
    content: functions/package.jsonの作成と依存関係のインストール
    status: pending
    dependencies:
      - setup-new-project
  - id: setup-permissions
    content: Cloud Vision APIの有効化とサービスアカウント権限設定
    status: pending
  - id: migrate-core-functions
    content: 既存コードの移植（getNanJComments、initYoutube、sleep）
    status: pending
    dependencies:
      - setup-dependencies
  - id: implement-init-firebase
    content: initFirebase.jsの実装（Cloud Functions環境対応）
    status: pending
    dependencies:
      - setup-dependencies
  - id: implement-filter-media
    content: filterMedia.jsの実装（Vision APIフィルタリング機能）
    status: pending
    dependencies:
      - setup-permissions
  - id: implement-firestore-service
    content: FirestoreService.jsの実装（画像登録、重複チェック）
    status: pending
    dependencies:
      - implement-init-firebase
  - id: implement-process-comments
    content: processComments.jsの実装（コメント処理ロジック）
    status: pending
    dependencies:
      - migrate-core-functions
      - implement-filter-media
      - implement-firestore-service
  - id: implement-update-playlists
    content: updatePlaylists.jsの実装（プレイリスト更新ロジック）
    status: pending
    dependencies:
      - migrate-core-functions
  - id: implement-cloud-functions
    content: index.jsの実装（Cloud Functionsエントリーポイント）
    status: pending
    dependencies:
      - implement-process-comments
      - implement-update-playlists
  - id: setup-pubsub-topics
    content: Pub/Sub Topicの作成（process-comments、update-playlists）
    status: pending
    dependencies:
      - implement-cloud-functions
  - id: setup-youtube-webhook
    content: YouTube PubSubHubbubの設定
    status: pending
    dependencies:
      - implement-cloud-functions
  - id: update-frontend
    content: koyokoyotube側の実装（RegistThread.jsの更新）
    status: pending
    dependencies:
      - implement-cloud-functions
  - id: test-and-deploy
    content: テストとデプロイ、動作確認
    status: pending
    dependencies:
      - setup-pubsub-topics
      - setup-youtube-webhook
      - update-frontend
---

# koyokoyofunctions: Firebase Functions新規プロジェクト構築計画

## プロジェクト構成

- **koyokoyoactions**: 既存プロジェクト（念のため保持、変更なし）
- **koyokoyofunctions**: 新規Cloud Functionsプロジェクト（本番環境として構築）

## アーキテクチャ全体像（イベント駆動型）

### トリガー1: Realtime Databaseへの登録検知（イベント駆動）

```
koyokoyotube（フロントエンド）
  ↓ (RegistThread.jsでRealtime Databaseに登録)
Realtime Database (thread/{videoId})
  ↓
フロントエンドからHTTPエンドポイントを呼び出し
  ↓
Cloud Function (triggerProcessComments) - HTTP Trigger
  ↓ (メッセージ発行)
Pub/Sub Topic (process-comments)
  ↓
Cloud Function (processComments) - Pub/Sub Trigger
  ↓
1. getNanJComments() - 5chスレッドからコメント・画像抽出
  ↓
2. filterMediaWithVision() - Vision APIでフィルタリング
  ↓
3. FirestoreService.registerMedia() - Firestoreに登録
  ↓
4. thread.gz保存（画像URLは含めない）
  ↓
5. Realtime Database更新 (update: false)
  ↓
6. Pub/Sub Topic (update-playlists) にメッセージ発行
  ↓
Cloud Function (updatePlaylists)
  ↓
再生リストと動画一覧を更新
```

### トリガー2: YouTubeチャンネル更新検知（イベント駆動）

```
YouTubeチャンネル (UC6eWCld0KwmyHFbAqK3V-Rw)
  ↓ (新規動画の追加)
YouTube PubSubHubbub
  ↓ (Webhook通知)
Cloud Function (youtubeWebhook) - HTTP Trigger
  ↓ (検証とメッセージ発行)
Pub/Sub Topic (update-playlists)
  ↓ (メッセージ発行)
Cloud Function (updatePlaylists) - Pub/Sub Trigger
  ↓
再生リストと動画一覧を更新
```

## 実装フェーズ

### フェーズ1: 新規プロジェクトのセットアップ

#### 1.1 koyokoyofunctionsプロジェクトの初期化

- [ ] `koyokoyofunctions`ディレクトリの作成
- [ ] Firebase Functionsの初期化
  ```bash
  cd koyokoyofunctions
  firebase init functions
  ```

- [ ] `firebase.json`の作成
- [ ] `.firebaserc`の作成（プロジェクトID: `koyokoyotube`）
- [ ] `.gitignore`の設定（`node_modules/`, `functions/node_modules/`等）

#### 1.2 依存関係の設定

- [ ] `functions/package.json`の作成と依存関係のインストール
  - `firebase-functions` (^4.5.0)
  - `firebase-admin` (^11.4.1)
  - `@google-cloud/pubsub` (^3.0.0)
  - `@google-cloud/vision` (^3.0.0)
  - `axios` (^1.2.2)
  - `cheerio` (^1.0.0-rc.12)
  - `googleapis` (^110.0.0)
  - `iconv-lite` (^0.6.3)
  - `iso8601-duration` (^2.1.1)

#### 1.3 サービスアカウントと権限設定

- [ ] Cloud Vision APIの有効化
- [ ] サービスアカウントに`Cloud Vision API User`権限を付与
- [ ] Firestoreへの書き込み権限確認
- [ ] Pub/Subの権限確認

### フェーズ2: 既存コードの移植

#### 2.1 コア機能の移植

- [ ] `koyokoyoactions/src/getNanJComments.js` → `functions/src/getNanJComments.js`
  - 画像抽出ロジックを維持
  - コメントと画像を分離して返す
  - 画像URL抽出の改善（正規表現の改善、HTMLパースの活用）
- [ ] `koyokoyoactions/src/initYoutube.js` → `functions/src/initYoutube.js`
  - YouTube APIの初期化と各種メソッド
  - サービスアカウント認証の調整
- [ ] `koyokoyoactions/src/sleep.js` → `functions/src/sleep.js`
  - そのまま移植

#### 2.2 Firebase初期化の実装

- [ ] `functions/src/initFirebase.js`の作成
  - Firebase Admin SDKの初期化（Cloud Functions環境対応）
  - Realtime Database、Storage、Firestoreへのアクセス
  - 環境変数による設定管理

#### 2.3 コメント処理ロジックの実装

- [ ] `functions/src/processComments.js`の作成
  - `koyokoyoactions/src/makeComments.js`をベースに実装
  - Vision APIフィルタリングの統合
  - Firestoreへの画像登録
  - `thread.gz`から画像URLを除外

#### 2.4 プレイリスト更新ロジックの実装

- [ ] `functions/src/updatePlaylists.js`の作成
  - `koyokoyoactions/src/makeVideos.js`をベースに実装
  - 再生リストと動画一覧の更新処理

### フェーズ3: 新規機能の実装

#### 3.1 Vision APIフィルタリング機能

- [ ] `functions/src/filterMedia.js`の作成
  - `determineStatus()`関数（承認状態判定ロジック）
  - `filterMediaWithVision()`関数（Vision API呼び出しとバッチ処理）
  - エラーハンドリングとリトライロジック
  - レート制限対策

#### 3.2 FirestoreServiceの実装

- [ ] `functions/src/services/FirestoreService.js`の作成
  - `registerMedia()`メソッド（画像登録）
  - `checkMediaExists()`メソッド（重複チェック）
  - `checkMediaExistsBatch()`メソッド（バッチ重複チェック）
  - `incrementReportCount()`メソッド（報告機能用、将来実装）

### フェーズ4: Cloud Functionsの実装

#### 4.1 エントリーポイントの実装

- [ ] `functions/src/index.js`の作成
  - `processComments`関数（Pub/Subトリガー）
  - `updatePlaylists`関数（Pub/Subトリガー）
  - `triggerProcessComments`関数（HTTPトリガー、フロントエンドから呼び出し）
  - `youtubeWebhook`関数（HTTPトリガー、PubSubHubbub用）

#### 4.2 エラーハンドリングとロギング

- [ ] エラー時のリトライロジック
- [ ] Cloud Loggingへのログ出力
- [ ] 失敗時の通知（オプション）

### フェーズ5: トリガー設定

#### 5.1 Pub/Sub TopicとSubscriptionの作成

- [ ] `process-comments`トピックの作成
- [ ] `update-playlists`トピックの作成
- [ ] 必要に応じてDead Letter Queueの設定

#### 5.2 YouTube PubSubHubbubの設定

- [ ] YouTube Data API v3でPubSubHubbubサブスクリプションを作成
- [ ] チャンネルID `UC6eWCld0KwmyHFbAqK3V-Rw` をサブスクライブ
- [ ] Webhook URL（Cloud Functions HTTPエンドポイント）を登録
- [ ] 検証トークンの設定

### フェーズ6: フロントエンド統合

#### 6.1 koyokoyotube側の実装

- [ ] `RegistThread.js`の更新
  - Realtime Database登録後、HTTPエンドポイントを呼び出し
  - エラーハンドリングとリトライロジック
- [ ] 環境変数の設定（Cloud Functions URL）

### フェーズ7: テストとデプロイ

#### 7.1 ローカルテスト

- [ ] Firebase Functions Emulatorでのテスト
- [ ] 単体テストの作成（オプション）

#### 7.2 デプロイ

- [ ] Cloud Functionsのデプロイ
- [ ] Pub/Sub Topicの作成
- [ ] YouTube PubSubHubbubの設定

#### 7.3 動作確認

- [ ] フロントエンドからHTTPエンドポイントを呼び出してテスト
- [ ] Vision APIの動作確認
- [ ] Firestoreへの登録確認
- [ ] `thread.gz`に画像URLが含まれないことを確認
- [ ] YouTube Webhookの動作確認

## ファイル構成（完成形）

```
koyokoyofunctions/
├── functions/
│   ├── src/
│   │   ├── index.js                    # Cloud Functionsエントリーポイント
│   │   ├── processComments.js          # コメント処理ロジック
│   │   ├── updatePlaylists.js          # プレイリスト更新ロジック
│   │   ├── getNanJComments.js          # 5chスレッドからコメント・画像抽出
│   │   ├── filterMedia.js              # Vision APIフィルタリング（新規）
│   │   ├── initFirebase.js             # Firebase初期化
│   │   ├── initYoutube.js              # YouTube API初期化
│   │   ├── sleep.js                    # スリープ関数
│   │   └── services/
│   │       └── FirestoreService.js     # Firestore操作（新規）
│   ├── package.json
│   └── .gitignore
├── firebase.json
├── .firebaserc
├── .gitignore
└── README.md
```

## 重要な設計決定

### プロジェクト分離

- **koyokoyoactions**: 既存システム（保持）
- **koyokoyofunctions**: 新規Cloud Functionsプロジェクト（本番環境）

### トリガー方式

**イベント駆動型**:

- フロントエンドからHTTPエンドポイントを呼び出し
- YouTube PubSubHubbubでWebhook通知
- Pub/Subで非同期処理

### Vision APIのコスト管理

- 既存画像の重複チェックを実装
- バッチ処理でレート制限に対応
- エラー時のログ記録

### データフロー

1. `thread.gz`には画像URLを含めない（NEW_MEDIA_FLOW.mdの要件）
2. 画像はFirestoreで個別管理
3. `status: 'approved'`のみフロントエンドで表示

## 次のステップ

1. **フェーズ1から開始**: 新規プロジェクトのセットアップ
2. **段階的に実装**: 各フェーズを順次実装・テスト
3. **既存システムとの並行運用**: 移行完了まで既存システムを維持

## 注意事項

- Vision APIの無料枠: 1,000リクエスト/月
- Cloud Functionsのタイムアウト: 最大540秒（9分）
- Pub/Subメッセージの保持期間: デフォルト7日
- 既存の`koyokoyoactions`は変更せず保持