/**
 * Resolve a still-image thumbnail for an exercise video URL.
 * Returns null when no thumbnail can be derived.
 *
 * Supports YouTube (watch / youtu.be / embed). For other URLs (Vimeo,
 * direct mp4, etc.) we don't fetch a still here — caller should fall back
 * to a play-icon placeholder.
 */
export function getVideoThumbnail(url: string | null | undefined): string | null {
 if (!url) return null;
 const m = url.match(
 /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
 );
 if (m) return `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`;
 return null;
}

export function isYoutubeUrl(url: string | null | undefined): boolean {
 if (!url) return false;
 return /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))/.test(
 url
 );
}
