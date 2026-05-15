import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Gauge, Calendar, ShieldCheck, FileCheck, Share2 } from "lucide-react";
import { formatNPR } from "@/lib/nepal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";

export interface ListingCardData {
  id: string;
  title: string;
  brand: string;
  price: number;
  year: number;
  mileage: number;
  district: string;
  condition: string;
  images: string[];
  featured?: boolean;
  accident_history?: boolean | null;
  num_owners?: number | null;
  status?: string;
  verification_level?: string | null;
  has_bluebook?: boolean | null;
  has_insurance?: boolean | null;
  has_tax_clearance?: boolean | null;
  has_registration?: boolean | null;
  shares?: number;
}

export function ListingCard({ listing, onSave, isSaved }: {
  listing: ListingCardData;
  onSave?: (id: string, price: number) => void;
  isSaved?: boolean;
}) {
  const cover = listing.images?.[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";

  // Calculate document score
  const documentScore = [
    listing.has_bluebook,
    listing.has_insurance,
    listing.has_tax_clearance,
    listing.has_registration
  ].filter(Boolean).length;

  const hasFullDocs = documentScore === 4;

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className={`group block rounded-xl overflow-hidden bg-card border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all duration-200 ${listing.status === "sold" ? "opacity-75" : ""}`}
    >
      {/* Image — 4:3 ratio (standard product photography) */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
          }}
        />
        {/* Gradient overlay — improves badge/button legibility over any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Sold overlay */}
        {listing.status === "sold" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-green-600 text-white font-bold px-4 py-2 rounded-full text-lg">
              SOLD
            </Badge>
          </div>
        )}

        {/* Badges — text-xs (12px) meets WCAG minimum */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {listing.featured && (
            <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize bg-background/90 text-xs px-2 py-0.5">
            {listing.condition}
          </Badge>
          {/* Trust badge for clean bikes */}
          {listing.accident_history === false && listing.num_owners === 1 && (
            <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              1 Owner · No Accidents
            </Badge>
          )}
          {/* Full docs badge */}
          {hasFullDocs && (
            <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              Full Docs
            </Badge>
          )}
        </div>

        {/* Save button */}
        {onSave && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(listing.id, listing.price); }}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-background/90 hover:bg-background shadow-sm"
            aria-label={isSaved ? "Remove from saved" : "Save listing"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        )}

        {/* Share indicator - top right */}
        {listing.shares !== undefined && listing.shares > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-background/90 rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <Share2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium">{listing.shares}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* text-base (16px) — primary identifier, must be readable */}
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {listing.title}
        </h3>
        {/* Show verification badge for verified or trusted sellers only */}
        {listing.verification_level && (listing.verification_level === "verified" || listing.verification_level === "trusted") && (
          <div className="mb-2">
            <VerificationBadge verification_level={listing.verification_level as any} />
          </div>
        )}
        <p className="text-xl font-bold text-primary leading-tight">
          {formatNPR(listing.price)}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" /> {listing.year}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3 flex-shrink-0" /> {listing.mileage.toLocaleString()} km
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" /> {listing.district}
          </span>
        </div>
      </div>
    </Link>
  );
}
