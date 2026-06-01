import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Gauge, Calendar, Bike } from "lucide-react";
import { formatNPR } from "@/lib/nepal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Returns a solid, legible colour class-pair for each condition value */
function conditionBadgeClass(condition: string): string {
  switch (condition?.toLowerCase()) {
    case "new":       return "bg-emerald-600 text-white border-transparent";
    case "excellent": return "bg-sky-600 text-white border-transparent";
    case "good":      return "bg-[#0B1D3A] text-white border-transparent";
    case "fair":      return "bg-amber-500 text-white border-transparent";
    case "poor":      return "bg-red-600 text-white border-transparent";
    default:          return "bg-zinc-700 text-white border-transparent";
  }
}

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
  const cover = listing.images?.[0] ?? null;
  const price = Number(listing.price);
  const mileage = Number(listing.mileage);
  const priceLabel = Number.isFinite(price) ? formatNPR(price) : "Price on request";
  const mileageLabel = Number.isFinite(mileage) && mileage > 0 ? mileage.toLocaleString() + " km" : "Mileage n/a";
  const yearLabel = listing.year ?? "Year n/a";

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block rounded-xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-border transition-all duration-300"
    >
      {/* Image — 16:10 ratio */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              el.parentElement?.querySelector(".mrn-img-fallback")?.classList.remove("hidden");
            }}
          />
        ) : null}
        {/* Fallback placeholder — shown when no image or image fails */}
        <div className={`mrn-img-fallback absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2 ${cover ? "hidden" : ""}`}>
          <Bike className="w-10 h-10 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground/60 font-medium">No image</span>
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Badges — top right */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {listing.featured && (
            <Badge className="bg-[#FF6A00] text-white text-[10px] px-2 py-0.5 font-semibold shadow-sm border-transparent">
              Featured
            </Badge>
          )}
          <Badge className={`capitalize text-[10px] px-2 py-0.5 font-semibold shadow-sm ${conditionBadgeClass(listing.condition)}`}>
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
