/**
 * Renders a country/track flag from the shared SVG sprite at /public/flags.svg
 * (one cached request for all flags instead of one file per flag).
 */
export function FlagIcon({ code, width = 21, height = 15, className, title }) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={title || code}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <use href={`/flags.svg#flag-${code}`} />
    </svg>
  );
}
