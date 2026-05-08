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
  mileage: number;
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
  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="group block rounded-xl overflow-hidden bg-card border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={cover}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {listing.featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">Featured</Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 capitalize bg-background/95">
          {listing.condition}
        </Badge>
        {onSave && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(listing.id); }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-background/95"
            aria-label="Save listing"
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </Button>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="text-xl font-bold text-primary">{formatNPR(listing.price)}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {listing.year}</span>
          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {listing.mileage.toLocaleString()} km</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.district}</span>
        </div>
      </div>
    </Link>
  );
}
