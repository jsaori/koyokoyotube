/**
 * Youtube Iframe Player APIのロード
 */
function loadIframeApi() {
  return new Promise(resolve => {
    if (
      typeof window.YT === "object" &&
      typeof window.YT.ready === "function"
    ) {
      window.YT.ready(() => {
        resolve(window.YT);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
}

let iframeApi = null;
export default function getIframeApi() {
  if (!iframeApi) {
    iframeApi = loadIframeApi();
  }
  return iframeApi;
}