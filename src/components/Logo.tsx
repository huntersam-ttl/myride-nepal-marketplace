import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      {/* White variant — shown on dark mobile navbar (lg breakpoint = 1024px) */}
      <img
        src="/brand/logo-navbar-v3-white.svg"
        alt="MyRideNepal"
        className="h-8 w-auto block lg:hidden"
      />
      {/* Dark variant — shown on light desktop navbar */}
      <img
        src="/brand/logo-navbar-v3.svg"
        alt="MyRideNepal"
        className="h-8 w-auto hidden lg:block"
      />
    </Link>
  );
}
