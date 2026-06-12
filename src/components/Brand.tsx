// Shared brand bits: the 8-bit gold sparkle, and the moxsf wordmark
// (pixel "mox" × gold sparkle × script "sf") — Rachel's logo direction, Page-2 palette.

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={`spark${className ? ` ${className}` : ''}`}
      viewBox="0 0 14 14"
      width="13"
      height="13"
      aria-hidden="true"
    >
      <rect x="6" y="1" width="2" height="12" />
      <rect x="1" y="6" width="12" height="2" />
      <rect className="spark-dim" x="3" y="3" width="2" height="2" />
      <rect className="spark-dim" x="9" y="3" width="2" height="2" />
      <rect className="spark-dim" x="3" y="9" width="2" height="2" />
      <rect className="spark-dim" x="9" y="9" width="2" height="2" />
    </svg>
  )
}

export function MoxLogo() {
  return (
    <span className="mox-logo" role="img" aria-label="moxsf">
      <span className="mox-pixel" aria-hidden="true">
        mox
      </span>
      <Sparkle className="mox-logo-spark" />
      <span className="mox-script" aria-hidden="true">
        sf
      </span>
    </span>
  )
}
