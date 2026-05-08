import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, User as UserIcon, LogOut, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/browse", label: "Browse Bikes" },
  { to: "/sell", label: "Sell Your Bike" },
  { to: "/price-estimator", label: "Price Estimator" },
  { to: "/blog", label: "Blog" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="w-4 h-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                  <UserIcon className="w-4 h-4 mr-2" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/saved" })}>
                  <Heart className="w-4 h-4 mr-2" /> Saved listings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/sell" })}>
                  <Plus className="w-4 h-4 mr-2" /> Post a listing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/auth" })}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as any })}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu className="w-5 h-5" /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <nav className="flex flex-col gap-1 mt-8">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-md text-base font-medium hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t my-3" />
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="px-3 py-3 rounded-md hover:bg-accent">Dashboard</Link>
                  <button
                    onClick={async () => { await signOut(); setOpen(false); navigate({ to: "/" }); }}
                    className="px-3 py-3 rounded-md hover:bg-accent text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Button onClick={() => { setOpen(false); navigate({ to: "/auth" }); }} className="w-full">Login / Signup</Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
