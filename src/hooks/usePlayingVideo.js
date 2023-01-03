import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CHANNEL_ID_LIST } from "../libs/constants";
import { useFireStorage } from "./useFireStorage";
import queryString from "query-string";

/**
 * プレイリストの動画再生を管理するHOOK
 * クエリパラメータ管理をWatchVideoNavigationとWatchVideoPlayerで行うことが面倒になったので導入
 */
export function usePlayingVideo() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = queryString.parse(location.search);

  const channel = ('channel' in query) ? query.channel : "";
  const playlistId = ('playlist' in query) ? query.playlist : "";
  const sort = ('sort' in query) ? query.sort : "publishDesc";
  const playlistPath = playlistId !== "" ? `data/playlist/${CHANNEL_ID_LIST[channel]}/playlist.gz` : "";
  const playlist = useFireStorage(playlistPath, null);
  const videoId = useParams().videoid;

  const sortChange = useCallback((prev, current) => {
    let comparison = 0;
    if (sort === "publishDesc") {
      comparison = new Date(current.publishedAt) - new Date(prev.publishedAt);
    } else if (sort === "publishAsc") {
      comparison = new Date(prev.publishedAt) - new Date(current.publishedAt);
    } else if (sort === "durationDesc") {
      comparison = Number(current.duration) - Number(prev.duration);
    } else if (sort === "durationAsc") {
      comparison = Number(prev.duration) - Number(current.duration);
    } else if (sort === "titleDesc") {
      comparison = current.title < prev.title ? 1 : -1;
    } else if (sort === "titleAsc") {
      comparison = prev.title < current.title ? 1 : -1;
    } else {
      comparison = 0;
    }
    return comparison;
  }, [sort]);

  const playlistTitle = useMemo(() => {
    if (!playlist) return "";
    // 探索・結合・ソートと重い処理を行うのでメモ化
    let playlistTitleTmp = playlist.data.playlists.find(playlist => playlist.id === playlistId).title;
    return playlistTitleTmp
  }, [playlist, playlistId])

  const videosData = useMemo(() => {
    if (!playlist) return null;
    // 探索・結合・ソートと重い処理を行うのでメモ化
    let videosDataTmp = playlist.data.playlists.find(playlist => playlist.id === playlistId).videos.concat();
    videosDataTmp = videosDataTmp.sort(sortChange).filter(v => v);
    return videosDataTmp;
  }, [playlist, playlistId, sortChange]);

  // クエリパラメータに基づくリストのindexに対応する動画を読み込み
  const navigateClickVideo = useCallback((index) => {
    if (!videosData) return;
    navigate(`/watch/${videosData[index].id}?channel=${channel}&playlist=${playlistId}&sort=${sort}`);
  }, [channel, playlistId, sort, videosData, navigate]);

  // クエリパラメータから、現在再生中の動画の次のindexの動画を読み込み
  const navigateNextVideo = useCallback(() => {
    if (!videosData) return;
    const nextId = videosData.indexOf(videosData.find(video => video.id === videoId)) + 1;
    if (nextId >= videosData.length) return;
    navigate(`/watch/${videosData[nextId].id}?channel=${channel}&playlist=${playlistId}&sort=${sort}`);
  }, [channel, playlistId, sort, videoId, navigate, videosData]);

  return ({
    playlistTitle: playlistTitle,
    videosData: videosData,
    navigateClickVideo: navigateClickVideo,
    navigateNextVideo: navigateNextVideo
  });
}