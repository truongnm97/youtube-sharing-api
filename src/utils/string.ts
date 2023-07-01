export function getYouTubeVideoId(url: string) {
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|watch\?v=|v\/)|youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})(?:\S+)?$/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return match[1];
  } else {
    // Check for shortened YouTube URL
    const shortenedRegExp = /^https?:\/\/youtu\.be\/([\w-]{11})$/;
    const shortenedMatch = url.match(shortenedRegExp);
    if (shortenedMatch && shortenedMatch[1]) {
      return shortenedMatch[1];
    } else {
      // Invalid or unsupported YouTube URL
      return null;
    }
  }
}
