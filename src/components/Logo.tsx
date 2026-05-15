import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-bold text-lg ${className}`}>
      <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary" style={{ width: 32, height: 32, minWidth: 32, overflow: "hidden" }}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="text-primary-foreground" style={{ width: 20, height: 20 }}>
          <circle cx="6" cy="17" r="3.5" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="17" r="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M6 17h6l4-7h4M10 10h4l2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="tracking-tight">
        <span className="text-foreground">MyRide</span>
        <span className="text-primary">Nepal</span>
      </span>
    </Link>
  );
}
