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
  const playlistPath = playlistId !== "" ? `data/playlist/${CHANNEL_ID_LIST[channel]}/playlist.gz` : "";
  const playlist = useFireStorage(playlistPath, null);

  const sortChange = useMemo(() => createSortFunction(sort), [sort]);

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
    return [...foundPlaylist.videos].sort(sortChange).filter(v => v);
  }, [playlist, playlistId, sortChange]);

  // クエリパラメータに基づくリストのindexに対応する動画を読み込み
  const navigateClickVideo = useCallback((index) => {
    if (!videosData || index < 0 || index >= videosData.length) return;
    navigate(`/watch/${videosData[index].id}?channel=${channel}&playlist=${playlistId}&sort=${sort}`);
  }, [channel, playlistId, sort, videosData, navigate]);

  // クエリパラメータから、現在再生中の動画の次のindexの動画を読み込み
  const navigateNextVideo = useCallback(() => {
    if (!videosData || !videoId) return;
    const currentIndex = videosData.findIndex(video => video.id === videoId);
    if (currentIndex === -1 || currentIndex + 1 >= videosData.length) return;
    navigate(`/watch/${videosData[currentIndex + 1].id}?channel=${channel}&playlist=${playlistId}&sort=${sort}`);
  }, [channel, playlistId, sort, videoId, videosData, navigate]);

  return ({
    playlistTitle: playlistTitle,
    videosData: videosData,
    navigateClickVideo: navigateClickVideo,
    navigateNextVideo: navigateNextVideo
  });
}