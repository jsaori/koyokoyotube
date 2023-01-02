import axios from "axios";
import { useCallback, useEffect, useState } from "react";

/**
 * Youtube動画情報を管理するHOOK
 */
export function useGetYoutubeTitle(videoId) {
  const [title, setTitle] = useState("");
  useEffect(() => {
    if (!videoId) {
      setTitle("");
      return;
    }
    const reqURL = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    axios.get(reqURL)
      .then((res) => setTitle(res.data.title));
  }, [videoId]);

  const getTitle = useCallback(async (id) => {
    if (id === "") return "";
    const reqURL = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const res = await axios.get(reqURL);
    return res.data.title;
  }, []);

  return [title, getTitle];
}
