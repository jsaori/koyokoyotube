import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CHANNEL_ID_LIST } from "../libs/constants";
import { createSortFunction } from "../libs/utilities";
import { useFireStorage } from "./useFireStorage";
import { useQueryString } from "./useQueryString";

/**
 * プレイリストの動画再生を管理するHOOK
 * クエリパラメータ管理をWatchVideoNavigationとWatchVideoPlayerで行うことが面倒になったので導入
 */
export function usePlayingVideo() {
  const navigate = useNavigate();
  const { query } = useQueryString();
  const videoId = useParams().videoid;

  const channel = query.channel || "";
  const playlistId = query.playlist || "";
  const sort = query.sort || "publishDesc";
  const isRandom = query.random === "true";
  const randomSeed = query.randomSeed || "";
  // 再生リストが指定されていない場合でも、動画が含まれる再生リストを検索するために再生リストデータを取得
  // channelが空の場合はデフォルトのチャンネル（koyori）を使用
  const effectiveChannel = channel !== "" ? channel : "koyori";
  const playlistPath = `data/playlist/${CHANNEL_ID_LIST[effectiveChannel]}/playlist.gz`;
  const playlist = useFireStorage(playlistPath, null);

  const sortChange = useMemo(() => createSortFunction(sort), [sort]);

  // シード値を使ったランダム並び替え関数
  const shuffleWithSeed = useCallback((array, seed) => {
    const shuffled = [...array];
    // シード値から乱数生成器を作成
    let currentSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    // Fisher-Yates シャッフル
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const playlistTitle = useMemo(() => {
    if (!playlist || !playlistId) return "";
    // 探索・結合・ソートと重い処理を行うのでメモ化
    const foundPlaylist = playlist.data?.playlists?.find(p => p.id === playlistId);
    return foundPlaylist?.title || "";
  }, [playlist, playlistId])

  const videosData = useMemo(() => {
    if (!playlist || !playlistId) return null;
    // 探索・結合・ソートと重い処理を行うのでメモ化
    const foundPlaylist = playlist.data?.playlists?.find(p => p.id === playlistId);
    if (!foundPlaylist?.videos) return null;
    let sorted = [...foundPlaylist.videos].sort(sortChange).filter(v => v);
    // ランダム再生モードの場合は、シード値を使ってランダムに並び替え
    if (isRandom && randomSeed) {
      sorted = shuffleWithSeed(sorted, randomSeed);
    }
    return sorted;
  }, [playlist, playlistId, sortChange, isRandom, randomSeed, shuffleWithSeed]);

  // クエリパラメータに基づくリストのindexに対応する動画を読み込み
  const navigateClickVideo = useCallback((index) => {
    if (!videosData || index < 0 || index >= videosData.length) return;
    const queryParams = new URLSearchParams();
    queryParams.set('channel', effectiveChannel);
    queryParams.set('playlist', playlistId);
    if (isRandom && randomSeed) {
      queryParams.set('random', 'true');
      queryParams.set('randomSeed', randomSeed);
    } else {
      queryParams.set('sort', sort);
    }
    navigate(`/watch/${videosData[index].id}?${queryParams.toString()}`);
  }, [effectiveChannel, playlistId, sort, isRandom, randomSeed, videosData, navigate]);

  // クエリパラメータから、現在再生中の動画の次のindexの動画を読み込み
  const navigateNextVideo = useCallback(() => {
    if (!videosData || !videoId) return;
    const currentIndex = videosData.findIndex(video => video.id === videoId);
    if (currentIndex === -1 || currentIndex + 1 >= videosData.length) return;
    const queryParams = new URLSearchParams();
    queryParams.set('channel', effectiveChannel);
    queryParams.set('playlist', playlistId);
    if (isRandom && randomSeed) {
      queryParams.set('random', 'true');
      queryParams.set('randomSeed', randomSeed);
    } else {
      queryParams.set('sort', sort);
    }
    navigate(`/watch/${videosData[currentIndex + 1].id}?${queryParams.toString()}`);
  }, [effectiveChannel, playlistId, sort, isRandom, randomSeed, videoId, videosData, navigate]);

  // 現在の動画が含まれる全再生リストを検索
  const playlistsContainingVideo = useMemo(() => {
    if (!playlist || !videoId) return [];
    // 探索・結合と重い処理を行うのでメモ化
    const foundPlaylists = playlist.data?.playlists?.filter(p => 
      p.videos && p.videos.some(v => v && v.id === videoId)
    ) || [];
    return foundPlaylists;
  }, [playlist, videoId]);

  // 再生リストを選択してナビゲート
  const navigateToPlaylist = useCallback((selectedPlaylistId) => {
    navigate(`/watch/${videoId}?channel=${effectiveChannel}&playlist=${selectedPlaylistId}&sort=${sort}`);
  }, [effectiveChannel, sort, videoId, navigate]);

  // 並べ替えを更新（ランダムモードを解除）
  const updateSort = useCallback((newSort) => {
    navigate(`/watch/${videoId}?channel=${effectiveChannel}&playlist=${playlistId}&sort=${newSort}`);
  }, [effectiveChannel, playlistId, videoId, navigate]);

  // 先頭から再生（最初の動画に移動）
  const navigateToFirst = useCallback(() => {
    if (!videosData || videosData.length === 0) return;
    const queryParams = new URLSearchParams();
    queryParams.set('channel', effectiveChannel);
    queryParams.set('playlist', playlistId);
    if (isRandom && randomSeed) {
      queryParams.set('random', 'true');
      queryParams.set('randomSeed', randomSeed);
    } else {
      queryParams.set('sort', sort);
    }
    navigate(`/watch/${videosData[0].id}?${queryParams.toString()}`);
  }, [effectiveChannel, playlistId, sort, isRandom, randomSeed, videosData, navigate]);

  // ランダム再生（再生リストをランダムに並び替えて先頭から再生）
  const navigateToRandom = useCallback(() => {
    if (!playlist || !playlistId) return;
    const foundPlaylist = playlist.data?.playlists?.find(p => p.id === playlistId);
    if (!foundPlaylist?.videos) return;
    // 新しいシード値を生成
    const newSeed = Date.now().toString() + Math.random().toString();
    // ランダムに並び替えたリストの先頭の動画に移動
    const shuffled = shuffleWithSeed([...foundPlaylist.videos].filter(v => v), newSeed);
    if (shuffled.length === 0) return;
    navigate(`/watch/${shuffled[0].id}?channel=${effectiveChannel}&playlist=${playlistId}&random=true&randomSeed=${newSeed}`);
  }, [effectiveChannel, playlistId, playlist, shuffleWithSeed, navigate]);

  return ({
    playlistTitle: playlistTitle,
    videosData: videosData,
    navigateClickVideo: navigateClickVideo,
    navigateNextVideo: navigateNextVideo,
    playlistsContainingVideo: playlistsContainingVideo,
    navigateToPlaylist: navigateToPlaylist,
    updateSort: updateSort,
    navigateToFirst: navigateToFirst,
    navigateToRandom: navigateToRandom,
    playlistId: playlistId,
    channel: effectiveChannel,
    sort: sort,
    isRandom: isRandom
  });
}