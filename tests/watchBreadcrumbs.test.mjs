import test from "node:test";
import assert from "node:assert/strict";
import { buildPlaylistPath, buildWatchBreadcrumbs } from "../src/libs/watchBreadcrumbs.mjs";

const knownChannels = ["koyori"];

test("再生リストから開いたときは再生リスト一覧と、並び順付きの再生リストへ戻す", () => {
  assert.deepEqual(buildWatchBreadcrumbs({
    channel: "koyori", knownChannels, playlistId: "PL123", playlistTitle: "歌枠", sort: "durationDesc", isRandom: false,
  }), [
    { label: "再生リスト", to: "/channel/koyori/playlist" },
    { label: "歌枠", to: "/channel/koyori/playlist/PL123?sort=durationDesc" },
  ]);
});

test("ランダム再生中は並び順を付けず、タイトルが未取得なら仮の名前を出す", () => {
  const items = buildWatchBreadcrumbs({
    channel: "koyori", knownChannels, playlistId: "PL123", playlistTitle: "", sort: "publishDesc", isRandom: true,
  });
  assert.deepEqual(items.at(-1), { label: "再生リスト", to: "/channel/koyori/playlist/PL123" });
});

test("動画一覧から開いたときは、開いたときの検索条件・ページの一覧へ戻す", () => {
  const from = "/channel/koyori/video?search_query=%E6%AD%8C&page=3";
  assert.deepEqual(buildWatchBreadcrumbs({ channel: "koyori", knownChannels, from }), [
    { label: "動画一覧", to: from },
  ]);
});

test("外から直接開いたときや、想定外の戻り先は既定の動画一覧にする", () => {
  for (const from of [undefined, "", "https://evil.example/", "/channel/koyori/videos", "/watch/abc", 42]) {
    assert.deepEqual(buildWatchBreadcrumbs({ channel: "koyori", knownChannels, from }), [
      { label: "動画一覧", to: "/channel/koyori/video" },
    ], String(from));
  }
});

test("未知のチャンネルは既定のチャンネルにする", () => {
  assert.equal(
    buildWatchBreadcrumbs({ channel: "../evil", knownChannels, playlistId: "PL1", sort: "publishDesc" })[0].to,
    "/channel/koyori/playlist",
  );
});

test("動画一覧の戻り先は、いずれかの有効なチャンネルの一覧なら受け付ける", () => {
  const from = "/channel/other/video?page=2";
  assert.equal(
    buildWatchBreadcrumbs({ channel: "koyori", knownChannels: ["koyori", "other"], from })[0].to,
    from,
  );
  assert.equal(
    buildWatchBreadcrumbs({ channel: "koyori", knownChannels, from })[0].to,
    "/channel/koyori/video",
  );
});

test("再生リストのページの URL は再生リスト ID をエンコードする", () => {
  assert.equal(
    buildPlaylistPath({ channel: "koyori", knownChannels, playlistId: "a/b?c", sort: "titleAsc", isRandom: false }),
    "/channel/koyori/playlist/a%2Fb%3Fc?sort=titleAsc",
  );
});
