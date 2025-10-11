interface YouTubeVideoInfo {
  title: string;
  author: string;
  thumbnail: string;
  videoId: string;
  lengthSeconds: number;
  isLiveContent: boolean;
}

interface SearchResult {
  url: string;
  title: string;
  videoId: string;
}

const YT_VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
const YT_PLAYLIST_REGEX = /[?&]list=/;

export function extractVideoId(url: string): string | null {
  const match = url.match(YT_VIDEO_ID_REGEX);
  return match ? String(match[1]) : null;
}

export function isPlaylistUrl(url: string): boolean {
  return YT_PLAYLIST_REGEX.test(url);
}

export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match.map((v) => parseInt(v || "0", 10));
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

export async function searchYoutubeVideo(
  query: string,
): Promise<SearchResult | null> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const html = await res.text();

    const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!match || !match[1]) return null;

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents;

    for (const section of contents || []) {
      const items = section?.itemSectionRenderer?.contents;
      for (const item of items || []) {
        const video = item.videoRenderer;
        if (video) {
          return {
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title.runs[0].text,
            videoId: video.videoId,
          };
        }
      }
    }
    return null;
  } catch (err) {
    console.error("[Scraper] YouTube search error:", err);
    return null;
  }
}

export async function getYouTubeVideoInfo(
  videoIdOrUrl: string,
): Promise<YouTubeVideoInfo | null> {
  const videoId = extractVideoId(videoIdOrUrl) || videoIdOrUrl;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    const html = await res.text();

    const match = html.match(
      /var ytInitialPlayerResponse = ({.*?});<\/script>/,
    );
    if (!match || !match[1]) return null;

    const data = JSON.parse(match[1]);
    const details = data.videoDetails;

    return {
      title: details.title,
      author: details.author,
      thumbnail: details.thumbnail.thumbnails.slice(-1)[0].url,
      videoId: details.videoId,
      lengthSeconds: parseInt(details.lengthSeconds, 10) || 0,
      isLiveContent: details.isLiveContent || false,
    };
  } catch (err) {
    console.error("[Scraper] YouTube video info error:", err);
    return null;
  }
}
