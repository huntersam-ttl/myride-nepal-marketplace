import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img
        src="/brand/logo-navbar-v3.svg"
        alt="MyRideNepal"
        className="h-8 w-auto"
      />
    </Link>
  );
}
