import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo className="text-secondary-foreground" />
          <p className="text-sm opacity-75 max-w-xs">
            Nepal's trusted bike & scooter marketplace. Buy and sell with confidence.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Marketplace</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/browse">Browse bikes</Link></li>
            <li><Link to="/sell">Sell your bike</Link></li>
            <li><Link to="/price-estimator">Price estimator</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/auth">Login / Signup</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Follow us</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="opacity-80 hover:opacity-100"><Facebook className="w-5 h-5" /></a>
            <a href="#" aria-label="Instagram" className="opacity-80 hover:opacity-100"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="Twitter" className="opacity-80 hover:opacity-100"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs opacity-70 text-center">
          © {new Date().getFullYear()} MyRideNepal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
