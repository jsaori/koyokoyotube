/**
 * 視聴画面から戻る先の一覧を決める
 * - 再生リストから開いたとき: 再生リスト一覧 › その再生リスト（並び順を引き継ぐ）
 * - 動画一覧から開いたとき: 開いたときの検索条件・ページの動画一覧
 * - 外から直接開いたとき: 動画一覧
 * @param {Object} params
 * @param {string} params.channel URL の channel（未知の値は既定のチャンネルにする）
 * @param {string[]} params.knownChannels 有効なチャンネル名
 * @param {string} [params.playlistId]
 * @param {string} [params.playlistTitle]
 * @param {string} [params.sort]
 * @param {boolean} [params.isRandom]
 * @param {string} [params.from] 動画一覧から開いたときの一覧の URL（history の state）
 * @returns {{label: string, to: string}[]} 上の階層から順に並べたリンク
 */
export function buildWatchBreadcrumbs({ channel, knownChannels, playlistId, playlistTitle, sort, isRandom, from }) {
  const channelPath = `/channel/${resolveChannel(channel, knownChannels)}`;

  if (playlistId) {
    return [
      { label: "再生リスト", to: `${channelPath}/playlist` },
      { label: playlistTitle || "再生リスト", to: buildPlaylistPath({ channel, knownChannels, playlistId, sort, isRandom }) },
    ];
  }

  // 外部 URL などを戻り先にしないよう、いずれかのチャンネルの動画一覧の URL だけを受け付ける
  const isVideoListUrl = typeof from === "string" && knownChannels.some((ch) => {
    const videoListPath = `/channel/${ch}/video`;
    return from === videoListPath || from.startsWith(`${videoListPath}?`);
  });
  return [
    { label: "動画一覧", to: isVideoListUrl ? from : `${channelPath}/video` },
  ];
}

/**
 * 再生リストのページの URL（ランダム再生中でなければ並び順を引き継ぐ）
 */
export function buildPlaylistPath({ channel, knownChannels, playlistId, sort, isRandom }) {
  const sortQuery = !isRandom && sort ? `?sort=${encodeURIComponent(sort)}` : "";
  return `/channel/${resolveChannel(channel, knownChannels)}/playlist/${encodeURIComponent(playlistId)}${sortQuery}`;
}

function resolveChannel(channel, knownChannels) {
  return knownChannels.includes(channel) ? channel : "koyori";
}
