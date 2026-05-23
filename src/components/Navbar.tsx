import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, User as UserIcon, LogOut, Heart, Plus, Shield, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-saved";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "./NotificationBell";

const NAV_LINKS = [
  { to: "/browse", label: "Browse" },
  { to: "/dealers", label: "Dealers" },
  { to: "/compare", label: "Compare" },
  { to: "/price-estimator", label: "Price Estimator" },
  { to: "/blog", label: "Blog" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full backdrop-blur transition-colors duration-200",
        // Mobile: Deep Navy with subtle gradient blend into hero
        "bg-[#0B1D3A]/95 supports-[backdrop-filter]:bg-[#0B1D3A]/90 border-0",
        // Desktop: original light navbar
        "lg:bg-background/90 lg:supports-[backdrop-filter]:bg-background/75 lg:border-b",
      ].join(" ")}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Left: Logo + nav */}
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: "text-primary font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Bell — logged in users only */}
          {user && <NotificationBell />}

          {/* Search icon — mobile only, jumps to /browse */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/browse" })}
            className="lg:hidden h-10 w-10 text-white hover:bg-white/10 hover:text-white"
            aria-label="Search bikes"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Sell CTA — visible on all widths now, compact label on mobile */}
          <Button
            size="sm"
            onClick={() => navigate({ to: "/sell" })}
            className="flex gap-1.5 font-semibold shadow-sm h-10 px-3 sm:h-9 sm:px-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sell your bike</span>
            <span className="md:hidden">Sell</span>
          </Button>

          {/* Account — desktop only */}
          <div className="hidden md:flex">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <UserIcon className="w-4 h-4" />
                    Account
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                    <UserIcon className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/saved" })}>
                    <Heart className="w-4 h-4 mr-2" /> Saved listings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/sell" })}>
                    <Plus className="w-4 h-4 mr-2" /> Post a listing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/dealer-signup" })}>
                    Become a dealer
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                      <Shield className="w-4 h-4 mr-2" /> Admin panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth" })}>
                Login
              </Button>
            )}
          </div>

          {/* Hamburger — mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 text-white hover:bg-white/10 hover:text-white" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] flex flex-col p-0">
              <SheetTitle className="sr-only">Main menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation and account actions</SheetDescription>
              <div className="p-5 border-b">
                <Logo />
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {/* Sell CTA in mobile sheet */}
                <Button
                  className="w-full gap-2 mb-5"
                  onClick={() => { navigate({ to: "/sell" }); setOpen(false); }}
                >
                  <Plus className="w-4 h-4" /> Sell your bike — Free
                </Button>

                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 rounded-md text-base font-medium hover:bg-accent transition-colors"
                      activeProps={{ className: "text-primary bg-primary/5" }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t my-4" />

                {user ? (
                  <nav className="flex flex-col gap-1">
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-base font-medium">
                      Dashboard
                    </Link>
                    <Link to="/saved" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-base font-medium">
                      Saved listings
                    </Link>
                    <Link to="/dealer-signup" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-base font-medium">
                      Become a dealer
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-base font-medium">
                        Admin panel
                      </Link>
                    )}
                    <button
                      onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }}
                      className="px-3 py-2.5 rounded-md hover:bg-destructive/10 text-left text-base font-medium text-destructive transition-colors"
                    >
                      Sign out
                    </button>
                  </nav>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setOpen(false); navigate({ to: "/auth" }); }}
                  >
                    Login / Sign up
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
