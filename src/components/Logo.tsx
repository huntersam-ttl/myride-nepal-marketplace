import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-bold text-lg ${className}`}>
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary-foreground">
          <circle cx="6" cy="17" r="3.5" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="17" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M6 17h6l4-7h4M10 10h4l2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="tracking-tight">
        <span className="text-secondary">MyRide</span>
        <span className="text-primary">Nepal</span>
      </span>
    </Link>
  );
}
