type WordmarkProps = {
  className?: string;
  markOnly?: boolean;
  size?: number;
};

export default function Wordmark({ className = "", markOnly = false, size = 30 }: WordmarkProps) {
  const mark = Math.round(size * 0.9);
  const textSize = Math.round(size * 1.05);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={mark}
        height={mark}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-white"
      >
        <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="1.15" fill="currentColor" />
      </svg>
      {!markOnly && (
        <span
          className="font-light tracking-tight text-white"
          style={{ fontSize: `${textSize}px`, lineHeight: 1 }}
        >
          LENS
        </span>
      )}
    </span>
  );
}
