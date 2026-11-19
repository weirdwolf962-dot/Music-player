export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function calculateProgressPercent(currentTime: number, duration: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  const ratio = (currentTime / duration) * 100;
  return Math.min(100, Math.max(0, ratio));
}

export function calculateSeekTime(fraction: number, duration: number): number {
  if (!Number.isFinite(fraction) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }
  const clamped = Math.min(1, Math.max(0, fraction));
  return clamped * duration;
}

export function getNextTrackIndex(currentIndex: number, totalTracks: number): number {
  if (totalTracks <= 0) return 0;
  return (((currentIndex + 1) % totalTracks) + totalTracks) % totalTracks;
}

export function getPreviousTrackIndex(currentIndex: number, totalTracks: number): number {
  if (totalTracks <= 0) return 0;
  return (((currentIndex - 1) % totalTracks) + totalTracks) % totalTracks;
}
