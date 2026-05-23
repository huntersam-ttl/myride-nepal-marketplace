import { Link } from "@tanstack/react-router";

type LogoVariant = "auto" | "light" | "dark";

interface LogoProps {
  /**
   * `auto` (default) — picks the variant by viewport: light below `lg`, dark at `lg+`.
   *   Use this only inside the Navbar, whose background colour flips at the same breakpoint.
   * `light` — always the white-mark + white-wordmark lockup. Use on dark backgrounds (footer, dark hero panels).
   * `dark`  — always the navy-mark + navy-wordmark lockup. Use on light backgrounds (auth body, light cards).
   */
  variant?: LogoVariant;
  className?: string;
}

/**
 * Single source of truth for the MyRideNepal logo.
 *
 * Mark asset:        /brand/myridenepal-logo-mark.png        (navy M + orange centred pin, transparent bg)
 * Light mark asset:  /brand/myridenepal-logo-mark-light.png  (white M + orange centred pin, transparent bg, for dark surfaces)
 *
 * Both are derived from the same source image — only the M-body color is swapped on the
 * light variant. The mark geometry and the pin position are identical, so the pin remains
 * centred exactly as in the brand asset on every surface.
 *
 * The wordmark "MyRideNepal" is rendered as text alongside the mark — same Inter 700,
 * -0.02em letter-spacing as the original v3 SVG wordmark — so it stays selectable,
 * scales crisply, and inherits the brand colour for the current surface.
 */
export function Logo({ variant = "auto", className = "" }: LogoProps) {
  // Shared mark size — kept at h-8 (32px) to match the previous v3 SVG height
  const markClass = "h-8 w-8 shrink-0";
  const wordmarkBase =
    "text-[19px] font-bold tracking-[-0.02em] leading-none whitespace-nowrap";

  const inner = (() => {
    if (variant === "light") {
      return (
        <>
          <img
            src="/brand/myridenepal-logo-mark-light.png"
            alt="MyRideNepal"
            className={markClass}
          />
          <span className={`${wordmarkBase} text-white`}>MyRideNepal</span>
        </>
      );
    }
    if (variant === "dark") {
      return (
        <>
          <img
            src="/brand/myridenepal-logo-mark.png"
            alt="MyRideNepal"
            className={markClass}
          />
          <span className={`${wordmarkBase} text-[#0B1D3A]`}>MyRideNepal</span>
        </>
      );
    }
    // auto — responsive light/dark pair, only meaningful when the surrounding
    // surface (navbar bg) also flips at the lg breakpoint.
    return (
      <>
        {/* Mobile (< lg): light mark for the dark navbar */}
        <img
          src="/brand/myridenepal-logo-mark-light.png"
          alt="MyRideNepal"
          className={`${markClass} block lg:hidden`}
        />
        {/* Desktop (≥ lg): dark mark for the light navbar */}
        <img
          src="/brand/myridenepal-logo-mark.png"
          alt="MyRideNepal"
          className={`${markClass} hidden lg:block`}
        />
        {/* Wordmark colour also flips at lg */}
        <span className={`${wordmarkBase} text-white lg:text-[#0B1D3A]`}>MyRideNepal</span>
      </>
    );
  })();

  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      {inner}
    </Link>
  );
}
