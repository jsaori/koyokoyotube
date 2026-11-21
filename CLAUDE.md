# CLAUDE.md

## GitHub アカウント（gh / git push）

このリポジトリは `jsaori` アカウントの所有です。このマシンの `gh` には複数の GitHub アカウントがログインしており、
`git push` / `git fetch` の認証も `gh auth git-credential` 経由で **gh のアクティブアカウント** が使われます。

`gh` コマンドや `git push` を実行する前に、必ずアクティブアカウントを `jsaori` にしてください。

```bash
# 確認（Active account: true が jsaori であること）
gh auth status --hostname github.com --active

# jsaori でなければ切り替える
gh auth switch --hostname github.com --user jsaori
```

- 切り替えはマシン全体（全リポジトリ・全シェル）に効くグローバル設定です。セッション途中で他のプロジェクトが
  アカウントを戻している可能性があるため、PR 作成・push など GitHub に書き込む操作の直前には毎回確認してください。
- `gh auth status` に `jsaori` が表示されない（未ログイン・トークン失効）場合は自分でログインせず、ユーザーに
  `gh auth login` の実行を依頼してください。
- 関連リポジトリ: `jsaori/koyokoyotube`, `jsaori/koyokoyofunctions`, `jsaori/koyokoyoimages`（いずれも同じルール）。
