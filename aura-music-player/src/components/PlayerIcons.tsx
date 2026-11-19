import type { SVGProps } from 'react';

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8.25 5.45c0-1.08 1.18-1.74 2.1-1.18l10.22 6.23c.88.54.88 1.82 0 2.36L10.35 19.09c-.92.56-2.1-.1-2.1-1.18V5.45Z" />
    </svg>
  );
}

export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <rect x="6.5" y="5" width="3.75" height="14" rx="1.4" />
      <rect x="13.75" y="5" width="3.75" height="14" rx="1.4" />
    </svg>
  );
}

export function PrevTrackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="6" width="2.4" height="12" rx="1.2" />
      <rect x="8" y="6" width="2.4" height="12" rx="1.2" />
      <path d="M22.5 6.8c0-.96-1.04-1.55-1.87-1.06l-7.45 4.46c-.8.48-.8 1.64 0 2.12l7.45 4.46c.83.5 1.87-.1 1.87-1.06V6.8Z" />
    </svg>
  );
}

export function NextTrackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M5.5 6.8c0-.96 1.04-1.55 1.87-1.06l7.45 4.46c.8.48.8 1.64 0 2.12l-7.45 4.46c-.83.5-1.87-.1-1.87-1.06V6.8Z" />
      <rect x="17.6" y="6" width="2.4" height="12" rx="1.2" />
      <rect x="22.1" y="6" width="2.4" height="12" rx="1.2" />
    </svg>
  );
}
