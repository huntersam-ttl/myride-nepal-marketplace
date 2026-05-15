import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Instagram, Mail } from "lucide-react";

const FOOTER_LINKS = {
  Marketplace: [
    { to: "/browse", label: "Browse bikes" },
    { to: "/sell", label: "Sell your bike" },
    { to: "/price-estimator", label: "Price estimator" },
    { to: "/dealers", label: "Dealers" },
    { to: "/compare", label: "Compare bikes" },
  ],
  Resources: [
    { to: "/blog", label: "Blog & guides" },
    { to: "/auth", label: "Login / Sign up" },
    { to: "/dashboard", label: "My listings" },
    { to: "/saved", label: "Saved listings" },
    { to: "/dealer-signup", label: "Become a dealer" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Logo className="text-secondary-foreground" />
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">
              Nepal's trusted marketplace for buying and selling bikes and scooters. Free to list, no commissions.
            </p>
            <div className="flex gap-3 pt-1">
              <a href="https://www.instagram.com/myridenepal/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="mailto:hello@myridenepal.com" aria-label="Email" className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide opacity-90">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm opacity-65 hover:opacity-100 transition-opacity"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide opacity-90">Contact</h4>
            <ul className="space-y-2.5 text-sm opacity-65">
              <li>Kathmandu, Nepal</li>
              <li>
                <a href="mailto:hello@myridenepal.com" className="hover:opacity-100 transition-opacity">
                  hello@myridenepal.com
                </a>
              </li>
              <li className="pt-2">
                <span className="text-xs opacity-50 uppercase tracking-wide">All 77 districts covered</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-50">
          <span>© {new Date().getFullYear()} MyRideNepal. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
