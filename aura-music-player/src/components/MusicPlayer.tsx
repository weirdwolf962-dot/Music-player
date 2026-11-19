import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { Music } from 'lucide-react';
import type { Song } from '../types/music';
import {
  calculateProgressPercent,
  calculateSeekTime,
  formatTime,
  getNextTrackIndex,
  getPreviousTrackIndex,
} from '../utils/playerLogic';
import {
  NextTrackIcon,
  PauseIcon,
  PlayIcon,
  PrevTrackIcon,
} from './PlayerIcons';

interface MusicPlayerProps {
  playlist: Song[];
}

export function MusicPlayer({ playlist }: MusicPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(
    playlist[0]?.durationHint ?? 0,
  );
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [imgError, setImgError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const isScrubbingRef = useRef(false);

  const currentSong = playlist[currentIndex];
  const effectiveDuration =
    duration > 0 ? duration : (currentSong?.durationHint ?? 0);
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = calculateProgressPercent(
    displayTime,
    effectiveDuration,
  );

  useEffect(() => {
    const audio = new Audio(playlist[0]?.src ?? '');
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isScrubbingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      shouldAutoPlayRef.current = true;
      setCurrentIndex((prev) => getNextTrackIndex(prev, playlist.length));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.src = '';
      audioRef.current = null;
    };
  }, [playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    setImgError(false);
    setCurrentTime(0);
    setDuration(currentSong.durationHint ?? 0);

    const resolvedSrc = new URL(currentSong.src, window.location.href).href;
    if (audio.src !== resolvedSrc) {
      audio.src = currentSong.src;
      audio.load();
    }

    if (shouldAutoPlayRef.current) {
      shouldAutoPlayRef.current = false;
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentIndex, currentSong]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, []);

  const handlePrevious = useCallback(() => {
    const audio = audioRef.current;
    shouldAutoPlayRef.current = Boolean(audio && !audio.paused);
    setCurrentIndex((prev) => getPreviousTrackIndex(prev, playlist.length));
  }, [playlist.length]);

  const handleNext = useCallback(() => {
    const audio = audioRef.current;
    shouldAutoPlayRef.current = Boolean(audio && !audio.paused);
    setCurrentIndex((prev) => getNextTrackIndex(prev, playlist.length));
  }, [playlist.length]);

  const getSeekTimeFromClientX = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current;
      if (!bar || effectiveDuration <= 0) return 0;
      const rect = bar.getBoundingClientRect();
      const fraction = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
      return calculateSeekTime(fraction, effectiveDuration);
    },
    [effectiveDuration],
  );

  const commitSeekTime = useCallback((nextTime: number) => {
    const audio = audioRef.current;
    setCurrentTime(nextTime);
    if (audio && Number.isFinite(nextTime)) {
      audio.currentTime = nextTime;
    }
  }, []);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isScrubbingRef.current = true;
    setIsScrubbing(true);
    const nextTime = getSeekTimeFromClientX(e.clientX);
    setScrubTime(nextTime);
    commitSeekTime(nextTime);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    const nextTime = getSeekTimeFromClientX(e.clientX);
    setScrubTime(nextTime);
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!isScrubbingRef.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const finalTime = getSeekTimeFromClientX(e.clientX);
    isScrubbingRef.current = false;
    setIsScrubbing(false);
    commitSeekTime(finalTime);
  };

  const handleSliderKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (effectiveDuration <= 0) return;
    const step = 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      commitSeekTime(Math.min(effectiveDuration, displayTime + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      commitSeekTime(Math.max(0, displayTime - step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      commitSeekTime(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      commitSeekTime(effectiveDuration);
    }
  };

  if (!currentSong) {
    return null;
  }

  return (
    <section
      aria-label="Music player"
      data-testid="music-player-card"
      data-state={isPlaying ? 'playing' : 'paused'}
      className="w-full max-w-[356px] rounded-[20px] bg-[#212936] p-5 shadow-[0_24px_64px_-16px_rgba(8,10,20,0.75)]"
    >
      {/* Album Artwork */}
      <div className="relative aspect-[378/356] w-full overflow-hidden rounded-[14px] bg-[#171c26]">
        {!imgError ? (
          <img
            src={currentSong.img}
            alt={`${currentSong.title} by ${currentSong.author} album cover`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full scale-[1.03] object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#3a1f3d] via-[#212936] to-[#1e3148] p-4 text-center">
            <Music className="h-10 w-10 text-[#C93B76]" aria-hidden="true" />
            <span className="text-xs font-medium text-[#E5E7EB]">
              {currentSong.title}
            </span>
          </div>
        )}
      </div>

      {/* Track Metadata */}
      <div className="mt-4 text-center">
        <h1 className="truncate text-[16px] font-semibold leading-[1.35] tracking-[-0.01em] text-[#E5E7EB]">
          {currentSong.title}
        </h1>
        <p className="mt-0.5 truncate text-[12px] font-medium leading-[1.4] text-[#7D8796]">
          {currentSong.author}
        </p>
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium leading-none tabular-nums text-[#7D8796]">
          <span data-testid="current-time">{formatTime(displayTime)}</span>
          <span data-testid="total-duration">
            {formatTime(effectiveDuration)}
          </span>
        </div>

        <div
          ref={progressBarRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek track progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(effectiveDuration)}
          aria-valuenow={Math.round(displayTime)}
          aria-valuetext={`${formatTime(displayTime)} of ${formatTime(effectiveDuration)}`}
          data-testid="progress-track"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleSliderKeyDown}
          className="group relative flex min-h-[28px] cursor-pointer touch-none items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B76]/80"
        >
          <div className="relative h-1 w-full overflow-visible rounded-full bg-[#E5E7EB]">
            <div
              data-testid="progress-fill"
              style={{ width: `${progressPercent}%` }}
              className="progress-fill-glow relative h-full rounded-full bg-[#C93B76] transition-[width] duration-75 ease-linear"
            >
              <span
                aria-hidden="true"
                className={`absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#C93B76] shadow-sm transition-transform duration-150 ${
                  isScrubbing
                    ? 'scale-110 opacity-100'
                    : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="mt-4 flex items-center justify-center gap-4 pb-1">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous track"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#667080] transition-colors duration-150 hover:text-[#E5E7EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B76]/80 active:scale-95"
        >
          <PrevTrackIcon className="h-6 w-7" />
        </button>

        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="play-btn-glow flex h-12 w-12 items-center justify-center rounded-full bg-[#C93B76] text-white transition-transform duration-150 hover:scale-105 hover:bg-[#d54380] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#212936] active:scale-95"
        >
          {isPlaying ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5 translate-x-[1px]" />
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next track"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[#667080] transition-colors duration-150 hover:text-[#E5E7EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93B76]/80 active:scale-95"
        >
          <NextTrackIcon className="h-6 w-7" />
        </button>
      </div>
    </section>
  );
}
