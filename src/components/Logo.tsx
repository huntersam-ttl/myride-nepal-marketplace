import { Link } from "@tanstack/react-router";

type LogoVariant = "auto" | "light" | "dark";

interface LogoProps {
  /**
   * `auto` (default) — picks the variant by viewport: white below `lg`, dark at `lg+`.
   *   Use this only inside the Navbar, whose background colour flips at the same breakpoint.
   * `light` — always the white-text logo. Use on dark backgrounds (e.g. footer, dark hero panels).
   * `dark` — always the dark-text logo. Use on light backgrounds (e.g. auth page body, light cards).
   */
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ variant = "auto", className = "" }: LogoProps) {
  const inner = (() => {
    if (variant === "light") {
      return (
        <img
          src="/brand/logo-navbar-v3-white.svg"
          alt="MyRideNepal"
          className="h-8 w-auto"
        />
      );
    }
    if (variant === "dark") {
      return (
        <img
          src="/brand/logo-navbar-v3.svg"
          alt="MyRideNepal"
          className="h-8 w-auto"
        />
      );
    }
    // auto — responsive pair, only correct inside a context whose bg also flips at lg
    return (
      <>
        <img
          src="/brand/logo-navbar-v3-white.svg"
          alt="MyRideNepal"
          className="h-8 w-auto block lg:hidden"
        />
        <img
          src="/brand/logo-navbar-v3.svg"
          alt="MyRideNepal"
          className="h-8 w-auto hidden lg:block"
        />
      </>
    );
  })();

  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {inner}
    </Link>
  );
}
