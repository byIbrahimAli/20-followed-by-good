interface ThemeIconProps {
  className?: string;
}

/** Half-light / half-dark circle — reads clearly as “theme” without Material Symbols font. */
export default function ThemeIcon({ className }: ThemeIconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      height="22"
      viewBox="0 0 24 24"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.42 0 8 3.58 8 8s-3.58 8-8 8z" />
    </svg>
  );
}
