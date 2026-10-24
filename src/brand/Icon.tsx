/**
 * Minimal stroke icon set (24px grid, 2px stroke, round caps) used for option
 * cards and status. PROPOSED stand-in for Tillee's icon package, which was
 * not available. Keep one stroke grammar; never mix in emoji.
 */
const PATHS: Record<string, string> = {
  link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1 M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
  document: 'M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6',
  pencil: 'M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4',
  laptop: 'M5 6h14v9H5z M3 19h18',
  briefcase: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  chart: 'M4 20V4 M4 20h16 M8 16l4-5 3 3 5-6',
  home: 'M4 11l8-7 8 7 M6 10v10h12V10 M10 20v-6h4v6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5 M12 16.5v.01 M12 3l9.5 17h-19z',
  info: 'M12 11v6 M12 7.5v.01 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  back: 'M15 5l-7 7 7 7',
  x: 'M6 6l12 12 M18 6L6 18',
  upload: 'M12 16V4 M7 9l5-5 5 5 M5 20h14',
  refresh: 'M20 12a8 8 0 1 1-2.34-5.66 M20 4v5h-5',
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
