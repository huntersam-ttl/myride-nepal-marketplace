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
      className="group block rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-border transition-all duration-300"
    >
      {/* Image — 16:10 ratio (premium, slightly wider for bikes) */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800";
          }}
        />
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Badges — top right, compact */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {listing.featured && (
            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 font-semibold shadow-sm">
              Featured
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize bg-background/95 backdrop-blur-sm text-[10px] px-2 py-0.5 font-medium shadow-sm">
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
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/95 backdrop-blur-sm hover:bg-background shadow-sm"
            aria-label={isSaved ? "Remove from saved" : "Save listing"}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        )}
      </div>

      {/* Info — premium spacing */}
      <div className="p-4 space-y-2">
        {/* Price first — strong hierarchy */}
        <p className="text-2xl font-bold text-foreground leading-none">
          {priceLabel}
        </p>
        
        {/* Title — limited to 2 lines max */}
        <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {listing.title}
        </h3>
        
        {/* Metadata row — compact, single line */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {yearLabel}
          </span>
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3 flex-shrink-0" />
            {mileageLabel}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {listing.district}
          </span>
        </div>
      </div>
    </Link>
  );
}
