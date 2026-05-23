import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Gauge, Calendar } from "lucide-react";
import { formatNPR } from "@/lib/nepal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ListingCardData {
  id: string;
  title: string;
  brand: string;
  price: number;
  year: number;
  mileage?: number;
  district: string;
  condition: string;
  images: string[];
  featured?: boolean;
}

export function ListingCard({ listing, onSave, isSaved }: {
  listing: ListingCardData;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}) {
  const cover = listing.images?.[0] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
  const price = Number(listing.price);
  const mileage = Number(listing.mileage);
  const priceLabel = Number.isFinite(price) ? formatNPR(price) : "Price on request";
  const mileageLabel = Number.isFinite(mileage) && mileage > 0 ? mileage.toLocaleString() + " km" : "Mileage n/a";
  const yearLabel = listing.year ?? "Year n/a";

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block rounded-xl overflow-hidden bg-card border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all duration-200"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

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
        </div>

        {/* Save button */}
        {onSave && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(listing.id); }}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-background/90 hover:bg-background shadow-sm"
            aria-label={isSaved ? "Remove from saved" : "Save listing"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* text-base (16px) — primary identifier, must be readable */}
        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {listing.title}
        </h3>
        <p className="text-xl font-bold text-primary leading-tight">
          {priceLabel}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2.5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" /> {yearLabel}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3 flex-shrink-0" /> {mileageLabel}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" /> {listing.district}
          </span>
        </div>
      </div>
    </Link>
  );
}
