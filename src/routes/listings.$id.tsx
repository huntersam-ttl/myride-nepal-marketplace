import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListingCard } from "@/components/ListingCard";
import { VerificationBadge } from "@/components/VerificationBadge";
import { BuyerSafetyChecklist } from "@/components/BuyerSafetyChecklist";
import { formatNPR, whatsappLink, telLink, smsLink } from "@/lib/nepal";
import { Phone, MessageCircle, MessageSquare, MapPin, Calendar, Gauge, Fuel, Bike, Heart, GitCompare, Share2, ChevronLeft, ChevronRight, Clock, ExternalLink, Tag, ShieldCheck, Users, AlertTriangle, Wrench, Shield, Settings, CheckCircle, AlertCircle, TrendingDown, FileText, XCircle, Info, Lightbulb, Copy, Flag, TrendingUp, Grid, Link as LinkIcon, Download } from "lucide-react";
import { useSavedIds, useToggleSave } from "@/hooks/use-saved";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateListingScore } from "@/utils/listingScore";
import { addRecentlyViewed } from "@/utils/recentlyViewed";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetailPage,
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("listings").select("*").eq("id", params.id).maybeSingle();
    if (error || !data) throw notFound();
    supabase.from("listings").update({ views: (data.views ?? 0) + 1 }).eq("id", params.id).then(() => {});
    return { listing: data };
  },
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Listing not found</h1>
      <p className="text-muted-foreground mt-2 mb-4">This listing may have been removed or sold.</p>
      <Link to="/browse" className="text-primary hover:underline font-medium">Browse all listings →</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-20 text-center">
      <p className="text-destructive">{error.message}</p>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.listing?.title ?? "Listing"} — MyRideNepal` },
      { name: "description", content: loaderData?.listing?.description?.slice(0, 160) ?? "Bike for sale on MyRideNepal" },
      { property: "og:image", content: loaderData?.listing?.images?.[0] ?? "" },
    ],
  }),
});

function ListingDetailPage() {
  const { listing } = Route.useLoaderData();
  const [imgIdx, setImgIdx] = useState(0);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [markingSold, setMarkingSold] = useState(false);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const cover = listing.images?.[imgIdx] || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200";
  const nav = useNavigate();
  const { data: savedIds } = useSavedIds();
  const toggleSave = useToggleSave();
  const isSaved = savedIds?.has(listing.id) ?? false;
  const { user } = useAuth();

  // Calculate quality score if user is the owner
  const qualityScore = useMemo(() => {
    if (user && listing.user_id === user.id) {
      return calculateListingScore(listing);
    }
    return null;
  }, [listing, user]);

  const gradeColor = qualityScore ? {
    A: "bg-green-600 text-white",
    B: "bg-blue-600 text-white",
    C: "bg-orange-600 text-white",
    D: "bg-red-600 text-white",
  }[qualityScore.grade] : "";

  // Track recently viewed listing
  useEffect(() => {
    if (listing && listing.status === "active") {
      addRecentlyViewed({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        brand: listing.brand,
        model: listing.model,
        year: listing.year,
        images: listing.images || [],
        district: listing.district,
        condition: listing.condition,
        status: listing.status,
        created_at: listing.created_at,
        user_id: listing.user_id,
      });
    }
  }, [listing]);

  const { data: similar, isLoading: similarLoading } = useQuery({
    queryKey: ["similar", listing.brand, listing.bike_type, listing.price, listing.id],
    queryFn: async () => {
      const results: any[] = [];
      const usedIds = new Set<string>();

      // First try: same brand and same bike_type
      if (listing.bike_type) {
        const { data: sameBrandType } = await supabase
          .from("listings")
          .select("id,title,brand,model,bike_type,price,year,mileage,district,condition,images,featured,user_id,status,created_at")
          .eq("status", "active")
          .eq("brand", listing.brand)
          .eq("bike_type", listing.bike_type)
          .neq("id", listing.id)
          .order("created_at", { ascending: false })
          .limit(6);
        
        if (sameBrandType) {
          results.push(...sameBrandType);
          sameBrandType.forEach(l => usedIds.add(l.id));
        }
      }

      // If fewer than 4 results, fetch same brand (any bike_type)
      if (results.length < 4) {
        const { data: sameBrand } = await supabase
          .from("listings")
          .select("id,title,brand,model,bike_type,price,year,mileage,district,condition,images,featured,user_id,status,created_at")
          .eq("status", "active")
          .eq("brand", listing.brand)
          .neq("id", listing.id)
          .not("id", "in", `(${Array.from(usedIds).join(",")})`)
          .order("created_at", { ascending: false })
          .limit(6 - results.length);
        
        if (sameBrand) {
          results.push(...sameBrand);
          sameBrand.forEach(l => usedIds.add(l.id));
        }
      }

      // If still fewer than 4 results, fetch similar price range (70% to 130%)
      if (results.length < 4) {
        const minPrice = Math.floor(listing.price * 0.7);
        const maxPrice = Math.ceil(listing.price * 1.3);
        
        const { data: similarPrice } = await supabase
          .from("listings")
          .select("id,title,brand,model,bike_type,price,year,mileage,district,condition,images,featured,user_id,status,created_at")
          .eq("status", "active")
          .neq("id", listing.id)
          .gte("price", minPrice)
          .lte("price", maxPrice)
          .not("id", "in", `(${Array.from(usedIds).join(",")})`)
          .order("created_at", { ascending: false })
          .limit(6 - results.length);
        
        if (similarPrice) {
          results.push(...similarPrice);
        }
      }

      // Fetch verification levels for similar listings
      if (results.length > 0) {
        const userIds = [...new Set(results.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, verification_level")
          .in("id", userIds);

        const verificationMap = new Map(profiles?.map(p => [p.id, p.verification_level]) || []);
        
        return results.slice(0, 6).map(listing => ({
          ...listing,
          verification_level: verificationMap.get(listing.user_id) || null,
        }));
      }

      return [];
    },
  });

  // Check if user has an existing offer on this listing
  const { data: existingOffer, refetch: refetchOffer } = useQuery({
    queryKey: ["my-offer", listing.id, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("offers")
        .select("*")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  // Fetch seller profile with verification level
  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile", listing.user_id],
    enabled: !!listing.user_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, verification_level")
        .eq("id", listing.user_id)
        .maybeSingle();
      return data;
    },
  });

  // Derive seller response time from their most recent listing activity
  const { data: sellerActivity } = useQuery({
    queryKey: ["seller-activity", listing.user_id],
    enabled: !!listing.user_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("listings")
        .select("created_at")
        .eq("user_id", listing.user_id)
        .order("created_at", { ascending: false })
        .limit(1);
      return data?.[0]?.created_at ?? null;
    },
  });

  const responseTimeBadge = (() => {
    if (!sellerActivity) return null;
    const hours = (Date.now() - new Date(sellerActivity).getTime()) / 36e5;
    if (hours < 3) return { label: "Usually replies within 1 hour", color: "bg-green-500/10 text-green-700 border-green-500/20" };
    if (hours < 24) return { label: "Usually replies within a few hours", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" };
    if (hours < 168) return { label: "Usually replies within 1 day", color: "bg-orange-500/10 text-orange-700 border-orange-500/20" };
    return null;
  })();

  // Check if user has saved this listing and get price_at_save
  const { data: savedListingData } = useQuery({
    queryKey: ["saved-listing-price", listing.id, user?.id],
    enabled: !!user?.id && isSaved,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_listings")
        .select("price_at_save")
        .eq("listing_id", listing.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const showPriceDrop = user && isSaved && savedListingData?.price_at_save && listing.price < savedListingData.price_at_save;

  const contactPhone = listing.phone || listing.whatsapp;
  const waPhone = listing.whatsapp || listing.phone;
  const hasContact = !!(contactPhone || waPhone);

  const waMsg = `Hi, I saw your ${listing.title} listed on MyRideNepal for ${formatNPR(listing.price)}. Is it still available?`;
  const wa  = whatsappLink(waPhone, waMsg);
  const tel = telLink(contactPhone);
  const sms = smsLink(contactPhone);

  const prevImg = () => setImgIdx(i => (i > 0 ? i - 1 : listing.images.length - 1));
  const nextImg = () => setImgIdx(i => (i < listing.images.length - 1 ? i + 1 : 0));

  const incrementShareCount = async () => {
    try {
      await supabase
        .from("listings")
        .update({ shares: ((listing as any).shares || 0) + 1 } as any)
        .eq("id", listing.id);
    } catch (error) {
      console.error("Failed to increment share count:", error);
    }
  };

  const share = () => {
    setShareDialogOpen(true);
  };

  const shareWhatsApp = () => {
    const text = `Check out this ${listing.brand} ${listing.model} ${listing.year} for ${formatNPR(listing.price)} on MyRideNepal`;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}%20${url}`, '_blank');
    incrementShareCount();
    toast.success("Opening WhatsApp...");
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    incrementShareCount();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      incrementShareCount();
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const generateShareCard = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark navy background
      ctx.fillStyle = '#0F1F3D';
      ctx.fillRect(0, 0, 1080, 1080);

      // Load and draw bike image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = listing.images?.[0] || '';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Draw image in top 60% with cover fit
      const imgHeight = 1080 * 0.6;
      const aspectRatio = img.width / img.height;
      let drawWidth = 1080;
      let drawHeight = 1080 / aspectRatio;
      let offsetY = 0;

      if (drawHeight < imgHeight) {
        drawHeight = imgHeight;
        drawWidth = imgHeight * aspectRatio;
      }

      const offsetX = (1080 - drawWidth) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Dark gradient overlay at bottom of photo
      const gradient = ctx.createLinearGradient(0, imgHeight - 200, 0, imgHeight);
      gradient.addColorStop(0, 'rgba(15, 31, 61, 0)');
      gradient.addColorStop(1, 'rgba(15, 31, 61, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, imgHeight - 200, 1080, 200);

      // MyRideNepal logo text in top left
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('MyRideNepal', 40, 60);

      // Listing title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      const title = listing.title.length > 30 ? listing.title.substring(0, 30) + '...' : listing.title;
      ctx.fillText(title, 40, imgHeight + 80);

      // Price in orange
      ctx.fillStyle = '#E84B1A';
      ctx.font = 'bold 56px Arial';
      ctx.fillText(formatNPR(listing.price), 40, imgHeight + 160);

      // Year, mileage, district
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText(`${listing.year} • ${listing.mileage?.toLocaleString()} km • ${listing.district}`, 40, imgHeight + 210);

      // White bar at bottom
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 1020, 1080, 60);
      
      // myridenepal.com text
      ctx.fillStyle = '#0F1F3D';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('myridenepal.com', 540, 1060);

      // Download
      const link = document.createElement('a');
      link.download = `${listing.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Failed to generate share card:", error);
      toast.error("Failed to generate image");
    }
  };

  // Questions feature
  const questions = [
    { id: 1, text: "Has this bike been in any accidents or major repairs?" },
    { id: 2, text: "Is the bluebook in your name and ready for transfer?" },
    { id: 3, text: "Why are you selling the bike?" },
    { id: 4, text: "Has the bike been serviced recently and do you have service records?" },
    { id: 5, text: "Are all parts original or have any been replaced?" },
    { id: 6, text: "Is there any existing loan or finance on this bike?" },
    { id: 7, text: "Can I have the bike inspected by a mechanic before buying?" },
    { id: 8, text: "Is the price negotiable?" },
    { id: 9, text: "How long have you owned the bike?" },
    { id: 10, text: "Can we meet in a public place for the test ride?" },
  ];

  // Determine which questions should be highlighted
  const highlightedQuestions = new Set<number>();
  
  // Highlight bluebook question if bluebook issues
  if (listing.has_bluebook === false || listing.bluebook_name_match === false) {
    highlightedQuestions.add(2);
  }
  
  // Highlight accidents question if accident history
  if (listing.accident_history === true) {
    highlightedQuestions.add(1);
  }
  
  // Highlight service question if no service history
  if (listing.service_history === false) {
    highlightedQuestions.add(4);
  }
  
  // Highlight loan question if price is suspiciously low (>10% below typical)
  // For simplicity, we'll check if price is more than 10% below a rough market estimate
  // This is a simplified heuristic - in production you'd have actual market data
  const roughMarketEstimate = listing.year >= 2020 ? 400000 : listing.year >= 2015 ? 250000 : 150000;
  if (listing.price < roughMarketEstimate * 0.9) {
    highlightedQuestions.add(6);
  }

  const toggleQuestion = (id: number) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sendQuestionsViaWhatsApp = () => {
    const selectedQs = questions.filter(q => selectedQuestions.has(q.id));
    if (selectedQs.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    const questionsList = selectedQs.map((q, idx) => `${idx + 1}. ${q.text}`).join("\n");
    const message = `Hi, I am interested in your ${listing.title} listed on MyRideNepal. I have a few questions:\n\n${questionsList}`;
    const waLink = whatsappLink(waPhone, message);
    
    if (waLink) {
      window.open(waLink, "_blank");
      setQuestionsDialogOpen(false);
    } else {
      toast.error("No WhatsApp number available");
    }
  };

  const copyAllQuestions = () => {
    const allQuestionsText = questions.map((q, idx) => `${idx + 1}. ${q.text}`).join("\n");
    navigator.clipboard.writeText(allQuestionsText);
    toast.success("Questions copied to clipboard");
  };

  const submitReport = async () => {
    if (!user || !reportReason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setSubmittingReport(true);
    try {
      // Check if user has already reported this listing
      const { data: existingReport } = await supabase
        .from("listing_reports")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("reporter_id", user.id)
        .maybeSingle();

      if (existingReport) {
        toast.error("You have already reported this listing");
        setReportDialogOpen(false);
        setReportReason("");
        setReportDetails("");
        setSubmittingReport(false);
        return;
      }

      // Insert the report
      const { error: reportError } = await supabase
        .from("listing_reports")
        .insert({
          listing_id: listing.id,
          reporter_id: user.id,
          reason: reportReason,
          details: reportDetails || null,
          status: "pending",
        });

      if (reportError) throw reportError;

      // Increment report_count on the listing
      const { error: updateError } = await supabase.rpc("increment_listing_report_count", {
        listing_id_param: listing.id,
      });

      if (updateError) console.error("Error updating report count:", updateError);

      // Get all admin users
      const { data: adminUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      // Create notifications for admins
      if (adminUsers && adminUsers.length > 0) {
        const notifications = adminUsers.map((admin) => ({
          user_id: admin.user_id,
          title: "New Listing Report",
          message: `A listing has been reported for ${reportReason}. Listing title: ${listing.title}`,
          type: "system",
          link: "/admin",
        }));

        await supabase.from("notifications").insert(notifications);
      }

      toast.success("Thank you for your report. Our team will review it within 24 hours.");
      setReportDialogOpen(false);
      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Non-active listings are only visible to their owner
  if (listing.status !== "active" && listing.status !== "sold" && user?.id !== listing.user_id) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Listing not available</h1>
        <p className="text-muted-foreground mt-2 mb-4">This listing is pending review or has been removed.</p>
        <Link to="/browse" className="text-primary hover:underline font-medium">Browse all listings →</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/browse" className="hover:text-foreground transition-colors">Listings</Link>
        <span>/</span>
        <span className="text-foreground truncate">{listing.title}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left column */}
        <div>
          {/* Gallery */}
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3] group">
            <img
              src={cover}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={() => prevImg()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => nextImg()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-white w-4" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {listing.images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-18 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    i === imgIdx ? "border-primary opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ width: "4.5rem" }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Title + price */}
          <div className="mt-5">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {listing.district}</span>
                  <Badge variant="secondary" className="capitalize">{listing.condition}</Badge>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">{formatNPR(listing.price)}</p>
            </div>
            
            {/* Price drop banner */}
            {showPriceDrop && savedListingData?.price_at_save && (
              <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Price dropped from {formatNPR(savedListingData.price_at_save)} to {formatNPR(listing.price)} since you saved this
                </p>
              </div>
            )}
          </div>

          {/* Key specs */}
          <Card className="mt-5 p-5">
            <h2 className="font-semibold mb-4 text-base">Key specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Spec icon={Calendar} label="Year" value={String(listing.year)} />
              <Spec icon={Gauge} label="Mileage" value={`${listing.mileage.toLocaleString()} km`} />
              <Spec icon={Fuel} label="Fuel" value={listing.fuel_type} />
              <Spec icon={Bike} label="Brand" value={listing.brand} />
              <Spec icon={Bike} label="Model" value={listing.model} />
              <Spec icon={Bike} label="Type" value={listing.bike_type} />
              {listing.colour && <Spec icon={Bike} label="Colour" value={listing.colour} />}
            </div>
          </Card>

          {listing.description && (
            <Card className="mt-4 p-5">
              <h2 className="font-semibold mb-3 text-base">Description</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground leading-relaxed">{listing.description}</p>
            </Card>
          )}
        </div>

        {/* Sticky contact sidebar — desktop */}
        <aside>
          <Card className="sticky top-20 shadow-md overflow-hidden">
            {/* Seller Info */}
            {sellerProfile && (
              <div className="px-5 py-4 border-b">
                <p className="text-xs text-muted-foreground mb-2">Listed by</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{sellerProfile.name || "Seller"}</p>
                  {sellerProfile.verification_level && (
                    <VerificationBadge verification_level={sellerProfile.verification_level as any} />
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Connect header */}
            <div className="bg-[#25D366]/10 border-b border-[#25D366]/20 px-5 py-4">
              <div className="flex items-center gap-2.5">
                {/* WhatsApp icon */}
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">WhatsApp Connect</p>
                  <p className="text-xs text-muted-foreground">Opens WhatsApp with message ready</p>
                </div>
              </div>
              {responseTimeBadge && (
                <div className={`mt-3 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border w-fit ${responseTimeBadge.color}`}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {responseTimeBadge.label}
                </div>
              )}
            </div>

            <div className="p-5">
              {/* Pre-filled message preview */}
              {wa && (
                <div className="mb-4 p-3 rounded-xl bg-muted/50 border text-xs text-muted-foreground leading-relaxed">
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5">Message that will be sent</p>
                  <p className="italic">"{waMsg}"</p>
                </div>
              )}

              <div className="space-y-2.5">
                <Button
                  asChild
                  size="lg"
                  className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white border-0"
                  disabled={!wa}
                >
                  <a
                    href={wa ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!wa}
                    onClick={(e) => { if (!wa) e.preventDefault(); }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp seller
                    <ExternalLink className="w-3 h-3 opacity-70 ml-auto" />
                  </a>
                </Button>
                
                {/* Ask Questions Button */}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full gap-2 border border-secondary text-secondary hover:bg-secondary hover:text-white transition-all"
                  onClick={() => setQuestionsDialogOpen(true)}
                  disabled={!waPhone}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask These Questions
                </Button>

                <Button asChild size="lg" variant="outline" className="w-full gap-2" disabled={!tel}>
                  <a href={tel ?? "#"} aria-disabled={!tel} onClick={(e) => { if (!tel) e.preventDefault(); }}>
                    <Phone className="w-4 h-4" /> Call seller
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full gap-2" disabled={!sms}>
                  <a href={sms ?? "#"} aria-disabled={!sms} onClick={(e) => { if (!sms) e.preventDefault(); }}>
                    <MessageSquare className="w-4 h-4" /> Text seller
                  </a>
                </Button>

                {/* Make an Offer / Offer Status */}
                {existingOffer ? (
                  // Show existing offer status
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Your Offer</span>
                      <Badge 
                        className={
                          existingOffer.status === "pending" 
                            ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" 
                            : existingOffer.status === "accepted" 
                            ? "bg-green-500/10 text-green-700 border-green-500/20"
                            : existingOffer.status === "declined"
                            ? "bg-red-500/10 text-red-700 border-red-500/20"
                            : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                        }
                      >
                        {existingOffer.status === "pending" ? "Pending" 
                          : existingOffer.status === "accepted" ? "Accepted"
                          : existingOffer.status === "declined" ? "Declined"
                          : "Countered"}
                      </Badge>
                    </div>
                    <div className="text-lg font-semibold">{formatNPR(existingOffer.offer_price)}</div>
                    {existingOffer.message && (
                      <p className="text-sm text-muted-foreground">{existingOffer.message}</p>
                    )}
                    
                    {/* Counter offer section */}
                    {existingOffer.status === "countered" && existingOffer.counter_price && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-muted-foreground">Seller's Counter Offer</span>
                          <div className="text-lg font-semibold text-blue-600">{formatNPR(existingOffer.counter_price)}</div>
                          {existingOffer.counter_message && (
                            <p className="text-sm text-muted-foreground">{existingOffer.counter_message}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from("offers")
                                  .update({ status: "accepted" })
                                  .eq("id", existingOffer.id);
                                
                                if (error) throw error;
                                toast.success("Counter offer accepted!");
                                refetchOffer();
                              } catch (error) {
                                console.error("Error accepting counter offer:", error);
                                toast.error("Failed to accept counter offer");
                              }
                            }}
                          >
                            Accept Counter Offer
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from("offers")
                                  .update({ status: "declined" })
                                  .eq("id", existingOffer.id);
                                
                                if (error) throw error;
                                toast.success("Counter offer declined");
                                refetchOffer();
                              } catch (error) {
                                console.error("Error declining counter offer:", error);
                                toast.error("Failed to decline counter offer");
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ) : (
                  // Show Make an Offer button
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            size="lg"
                            className="w-full gap-2 bg-secondary text-white hover:bg-secondary/90"
                            disabled={!user || listing.user_id === user?.id}
                            onClick={() => setOfferDialogOpen(true)}
                          >
                            <Tag className="w-4 h-4" /> Make an Offer
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!user && (
                        <TooltipContent>
                          <p>Login to make an offer</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Mark as Sold button - only for owner when listing is active */}
                {user && listing.user_id === user.id && listing.status === "active" && (
                  <Button
                    size="lg"
                    className="w-full gap-2 bg-green-700 hover:bg-green-800 text-white"
                    onClick={() => setSoldDialogOpen(true)}
                  >
                    Mark as Sold
                  </Button>
                )}

                {/* Quality Score Card - only for owner */}
                {user && listing.user_id === user.id && qualityScore && (
                  <Card className="p-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">Listing Quality Score</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-16 h-16 rounded-full ${gradeColor} flex flex-col items-center justify-center flex-shrink-0`}>
                        <div className="text-2xl font-bold">{qualityScore.score}</div>
                        <div className="text-xs font-semibold">Grade {qualityScore.grade}</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-2">
                          {qualityScore.score >= 85 ? "Excellent listing!" : 
                           qualityScore.score >= 70 ? "Good listing" :
                           qualityScore.score >= 50 ? "Could be better" :
                           "Needs improvement"}
                        </p>
                        <Link
                          to="/listings/$id/edit"
                          params={{ id: listing.id }}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <TrendingUp className="w-3 h-3" />
                          Improve your score
                        </Link>
                      </div>
                    </div>
                  </Card>
                )}

                {!hasContact && (
                  <p className="text-xs text-muted-foreground text-center">Seller contact unavailable.</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => toggleSave(listing.id, listing.price)}>
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => nav({ to: "/compare", search: { ids: listing.id } as any })}>
                  <GitCompare className="w-4 h-4" /> Compare
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={share}>
                  <Share2 className="w-4 h-4" /> 
                  Share
                  {(listing as any).shares > 0 && (
                    <span className="text-muted-foreground">· {(listing as any).shares}</span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Bike History Report Card */}
      {(listing.num_owners || listing.accident_history !== null || listing.service_history !== null || 
        listing.registration_expiry || listing.insurance_valid !== null || listing.original_parts !== null) ? (
        <section className="mt-14">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Bike History Report</h2>
                <p className="text-sm text-muted-foreground">Provided by seller and verified by MyRideNepal team</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Number of Owners */}
              {listing.num_owners && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Number of Owners</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {listing.num_owners} {listing.num_owners === 1 ? 'Owner' : 'Owners'}
                    </p>
                  </div>
                </div>
              )}

              {/* Accident History */}
              {listing.accident_history !== null && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Accident History</p>
                    <div className="mt-1">
                      {listing.accident_history ? (
                        <>
                          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
                            Accident reported
                          </Badge>
                          {listing.accident_details && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              {listing.accident_details}
                            </p>
                          )}
                        </>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          No accidents reported
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Service History */}
              {listing.service_history !== null && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <Wrench className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Service History</p>
                    <div className="mt-1">
                      {listing.service_history ? (
                        <>
                          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                            Service history available
                          </Badge>
                          {listing.last_service_date && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Last service: {new Date(listing.last_service_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          No service records
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Expiry */}
              {listing.registration_expiry && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Registration Expiry</p>
                    <div className="mt-1">
                      {(() => {
                        const expiryDate = new Date(listing.registration_expiry);
                        const now = new Date();
                        const threeMonthsFromNow = new Date();
                        threeMonthsFromNow.setMonth(now.getMonth() + 3);
                        
                        const isExpired = expiryDate < now;
                        const isExpiringSoon = !isExpired && expiryDate < threeMonthsFromNow;
                        const isValid = !isExpired && !isExpiringSoon;

                        const formattedDate = expiryDate.toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        });

                        return (
                          <>
                            <p className={`text-sm font-medium ${
                              isExpired ? 'text-red-600' : 
                              isExpiringSoon ? 'text-orange-600' : 
                              'text-green-600'
                            }`}>
                              {formattedDate}
                            </p>
                            <Badge className={`mt-1 ${
                              isExpired ? 'bg-red-100 text-red-800 border-red-200' :
                              isExpiringSoon ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-green-100 text-green-800 border-green-200'
                            } hover:bg-opacity-100`}>
                              {isExpired ? (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Expired
                                </>
                              ) : isExpiringSoon ? (
                                <>
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Expiring soon
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Valid
                                </>
                              )}
                            </Badge>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Insurance */}
              {listing.insurance_valid !== null && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Insurance</p>
                    <div className="mt-1">
                      {listing.insurance_valid ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Currently insured
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Not insured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Original Parts */}
              {listing.original_parts !== null && (
                <div className="flex items-start gap-3 py-3 border-b">
                  <Settings className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Original Parts</p>
                    <div className="mt-1">
                      {listing.original_parts ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          All original parts
                        </Badge>
                      ) : (
                        <>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
                            Modified
                          </Badge>
                          {listing.modifications && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              {listing.modifications}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-3 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                These details are self-reported by the seller. Always inspect the bike in person and verify documents before purchasing.
              </p>
            </div>
          </Card>
        </section>
      ) : null}

      {/* Documents and Paperwork Section */}
      {(() => {
        const hasAnyDocInfo = listing.has_bluebook !== null || 
                               listing.has_insurance !== null || 
                               listing.has_tax_clearance !== null || 
                               listing.has_registration !== null ||
                               listing.document_notes;
        
        if (!hasAnyDocInfo) return null;

        const hasNoDocsProvided = !listing.has_bluebook && 
                                   !listing.has_insurance && 
                                   !listing.has_tax_clearance && 
                                   !listing.has_registration &&
                                   !listing.document_notes;

        return (
          <section className="mt-14">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Documents Available</h2>
                  <p className="text-sm text-muted-foreground">Paperwork and ownership documents</p>
                </div>
              </div>

              {hasNoDocsProvided ? (
                <p className="text-sm text-muted-foreground py-4">
                  Seller has not provided document information yet.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* Bluebook */}
                    <div className="flex items-start gap-3 py-3 border-b">
                      {listing.has_bluebook ? (
                        listing.bluebook_name_match ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">Bluebook</p>
                              <p className="text-sm text-green-600 font-medium mt-1">
                                Available — In seller's name
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">Bluebook</p>
                              <p className="text-sm text-orange-600 font-medium mt-1">
                                Available — Not in seller's name
                              </p>
                              <p className="text-xs text-orange-600/80 mt-1">
                                Name transfer required
                              </p>
                            </div>
                          </>
                        )
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Bluebook</p>
                            <p className="text-sm text-gray-400 mt-1">Not available</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Insurance Document */}
                    <div className="flex items-start gap-3 py-3 border-b">
                      {listing.has_insurance ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Insurance Document</p>
                            <p className="text-sm text-green-600 font-medium mt-1">Available</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Insurance Document</p>
                            <p className="text-sm text-gray-400 mt-1">Not available</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Tax Clearance */}
                    <div className="flex items-start gap-3 py-3 border-b">
                      {listing.has_tax_clearance ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Tax Clearance</p>
                            <p className="text-sm text-green-600 font-medium mt-1">Available</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Tax Clearance</p>
                            <p className="text-sm text-gray-400 mt-1">Not available</p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Registration Certificate */}
                    <div className="flex items-start gap-3 py-3 border-b">
                      {listing.has_registration ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Registration Certificate</p>
                            <p className="text-sm text-green-600 font-medium mt-1">Available</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Registration Certificate</p>
                            <p className="text-sm text-gray-400 mt-1">Not available</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Document Notes */}
                  {listing.document_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700 mb-1">Additional Information</p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {listing.document_notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Tip */}
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900 mb-1">Verification Tip</p>
                        <p className="text-sm text-yellow-800 leading-relaxed">
                          Always verify original documents in person before making any payment. Ask the seller to show you the original bluebook and check the engine and chassis numbers match.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </section>
        );
      })()}

      {/* Buyer Safety Checklist - only show to non-owners */}
      {user && listing.user_id !== user.id && (
        <section className="mt-14">
          <BuyerSafetyChecklist listing={{
            ...listing,
            verification_level: sellerProfile?.verification_level || "basic",
          }} />
        </section>
      )}

      {/* Similar listings */}
      <section className="mt-14">
        <div className="flex items-center gap-2 mb-5">
          <Grid className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Similar Bikes You Might Like</h2>
        </div>
        
        {similarLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : similar && similar.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {similar.map(l => <ListingCard key={l.id} listing={l as any} />)}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Bike className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No similar bikes found right now</p>
            <Button asChild variant="outline">
              <Link to="/browse">Browse All Bikes</Link>
            </Button>
          </Card>
        )}
      </section>

      {/* Report Listing Button */}
      {user && listing.user_id !== user.id && (
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => setReportDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 cursor-pointer transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Report this listing
          </button>
        </div>
      )}

      {/* Mobile sticky contact bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-background/95 backdrop-blur border-t shadow-lg">
        {responseTimeBadge && (
          <div className={`flex items-center justify-center gap-1.5 text-xs py-1.5 border-b ${responseTimeBadge.color}`}>
            <Clock className="w-3 h-3" />
            {responseTimeBadge.label}
          </div>
        )}
        <div className="p-3 flex gap-2">
          <Button
            asChild
            size="lg"
            className="flex-1 gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white border-0 text-sm"
            disabled={!wa}
          >
            <a
              href={wa ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!wa}
              onClick={(e) => { if (!wa) e.preventDefault(); }}
            >
              <MessageCircle className="w-4 h-4 flex-shrink-0" /> WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 gap-1.5 text-sm" disabled={!tel}>
            <a href={tel ?? "#"} aria-disabled={!tel} onClick={(e) => { if (!tel) e.preventDefault(); }}>
              <Phone className="w-4 h-4 flex-shrink-0" /> Call
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 gap-1.5 text-sm" disabled={!sms}>
            <a href={sms ?? "#"} aria-disabled={!sms} onClick={(e) => { if (!sms) e.preventDefault(); }}>
              <MessageSquare className="w-4 h-4 flex-shrink-0" /> Text
            </a>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-shrink-0 h-11 w-11"
            onClick={() => toggleSave(listing.id, listing.price)}
            aria-label="Save listing"
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Make an Offer Dialog */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Asking Price */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Asking Price:</span>
              <span className="font-semibold">{formatNPR(listing.price)}</span>
            </div>

            {/* Offer Price Input */}
            <div className="space-y-2">
              <Label htmlFor="offer-price">Your Offer Price *</Label>
              <Input
                id="offer-price"
                type="number"
                placeholder="Enter your offer amount"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                min="0"
                step="1000"
              />
              {offerPrice && Number(offerPrice) > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className={Number(offerPrice) < listing.price ? "text-green-600" : "text-red-600"}>
                    {Number(offerPrice) < listing.price ? "↓" : "↑"} {formatNPR(Number(offerPrice))} 
                    ({((Number(offerPrice) - listing.price) / listing.price * 100).toFixed(1)}%)
                  </span>
                  <span className="text-muted-foreground">
                    Difference: {formatNPR(Math.abs(Number(offerPrice) - listing.price))}
                  </span>
                </div>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="offer-message">Message (Optional)</Label>
              <Textarea
                id="offer-message"
                placeholder="Add a message to the seller..."
                value={offerMessage}
                onChange={(e) => {
                  if (e.target.value.length <= 300) {
                    setOfferMessage(e.target.value);
                  }
                }}
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {offerMessage.length}/300 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setOfferDialogOpen(false);
                  setOfferPrice("");
                  setOfferMessage("");
                }}
                disabled={submittingOffer}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-secondary hover:bg-secondary/90"
                disabled={!offerPrice || Number(offerPrice) <= 0 || submittingOffer}
                onClick={async () => {
                  if (!user || !offerPrice) return;
                  
                  // Validate offer price is positive
                  const price = Number(offerPrice);
                  if (price <= 0 || isNaN(price)) {
                    toast.error("Please enter a valid offer price");
                    return;
                  }

                  setSubmittingOffer(true);
                  try {
                    // Check for existing pending offer
                    const { data: existingOffers } = await supabase
                      .from("offers")
                      .select("id, status")
                      .eq("listing_id", listing.id)
                      .eq("buyer_id", user.id)
                      .eq("status", "pending");

                    if (existingOffers && existingOffers.length > 0) {
                      toast.error("You already have a pending offer on this listing");
                      setSubmittingOffer(false);
                      return;
                    }

                    // Insert the offer
                    const { error } = await supabase.from("offers").insert({
                      listing_id: listing.id,
                      buyer_id: user.id,
                      seller_id: listing.user_id,
                      offer_price: price,
                      message: offerMessage || null,
                      status: "pending"
                    });

                    if (error) throw error;

                    // Create notification for seller
                    const buyerName = user.user_metadata?.full_name || user.email?.split('@')[0] || "A buyer";
                    await supabase.from("notifications").insert({
                      user_id: listing.user_id,
                      type: "offer_received",
                      title: "New Offer Received",
                      message: `${buyerName} made an offer of ${formatNPR(price)} on your ${listing.title}`,
                      link: "/dashboard/offers",
                      read: false
                    });

                    toast.success("Offer submitted successfully! The seller will be notified.");
                    setOfferDialogOpen(false);
                    setOfferPrice("");
                    setOfferMessage("");
                    refetchOffer(); // Refresh the offer data
                  } catch (error) {
                    console.error("Error submitting offer:", error);
                    toast.error("Failed to submit offer. Please try again.");
                  } finally {
                    setSubmittingOffer(false);
                  }
                }}
              >
                {submittingOffer ? "Sending..." : "Submit Offer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Sold Dialog */}
      <Dialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark this bike as sold</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Once marked as sold, this listing will no longer appear in search results. Optionally enter the final sale price below.
            </p>

            {/* Final Sale Price Input */}
            <div className="space-y-2">
              <Label htmlFor="sold-price">Final Sale Price (NPR) — Optional</Label>
              <Input
                id="sold-price"
                type="number"
                placeholder="Enter final sale price"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
                min="0"
                step="1000"
              />
              {soldPrice && Number(soldPrice) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Final price: {formatNPR(Number(soldPrice))}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSoldDialogOpen(false);
                  setSoldPrice("");
                }}
                disabled={markingSold}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800 text-white"
                disabled={markingSold}
                onClick={async () => {
                  if (!user) return;
                  
                  setMarkingSold(true);
                  try {
                    const updateData: any = {
                      status: "sold",
                      sold_at: new Date().toISOString()
                    };

                    // Add sold_price if provided and valid
                    if (soldPrice && Number(soldPrice) > 0 && !isNaN(Number(soldPrice))) {
                      updateData.sold_price = Number(soldPrice);
                    }

                    const { error } = await supabase
                      .from("listings")
                      .update(updateData)
                      .eq("id", listing.id)
                      .eq("user_id", user.id); // Extra security check

                    if (error) throw error;

                    toast.success("Your listing has been marked as sold");
                    setSoldDialogOpen(false);
                    setSoldPrice("");
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                      nav({ to: "/dashboard" });
                    }, 500);
                  } catch (error) {
                    console.error("Error marking as sold:", error);
                    toast.error("Failed to mark listing as sold. Please try again.");
                  } finally {
                    setMarkingSold(false);
                  }
                }}
              >
                {markingSold ? "Marking as Sold..." : "Confirm Sold"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Questions Dialog */}
      <Dialog open={questionsDialogOpen} onOpenChange={setQuestionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suggested Questions to Ask the Seller</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Tap any question to send it via WhatsApp or copy all questions at once
            </p>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            {questions.map((question) => {
              const isSelected = selectedQuestions.has(question.id);
              const isHighlighted = highlightedQuestions.has(question.id);
              
              return (
                <div
                  key={question.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? "bg-secondary/10 border-secondary" 
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => toggleQuestion(question.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleQuestion(question.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <p className="text-sm flex-1">{question.text}</p>
                      {isHighlighted && (
                        <span className="flex items-center gap-1 text-xs text-primary whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          Recommended
                        </span>
                      )}
                    </div>
                    {isHighlighted && (
                      <p className="text-xs text-primary mt-1">
                        Based on this listing
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={copyAllQuestions}
            >
              <Copy className="w-4 h-4" />
              Copy All Questions
            </Button>
            <Button
              className="flex-1 gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
              onClick={sendQuestionsViaWhatsApp}
              disabled={selectedQuestions.size === 0}
            >
              <MessageCircle className="w-4 h-4" />
              Send Selected via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Listing Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report Suspicious Listing</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Help us keep MyRideNepal safe and trustworthy
            </p>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Reason Select */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason for reporting *</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger id="report-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fake_or_scam">Fake or scam listing</SelectItem>
                  <SelectItem value="wrong_info">Wrong or misleading information</SelectItem>
                  <SelectItem value="stolen">Stolen bike</SelectItem>
                  <SelectItem value="fraudulent_price">Price is fraudulent</SelectItem>
                  <SelectItem value="duplicate">Duplicate listing</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="report-details">Additional details (optional)</Label>
              <Textarea
                id="report-details"
                placeholder="Please provide any additional information that will help us investigate"
                value={reportDetails}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setReportDetails(e.target.value);
                  }
                }}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {reportDetails.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setReportDialogOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                disabled={submittingReport}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                disabled={!reportReason || submittingReport}
                onClick={submitReport}
              >
                {submittingReport ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Listing Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this listing</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to share this bike
            </p>
          </DialogHeader>
          
          <div className="space-y-2 py-4">
            {/* WhatsApp Share */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={shareWhatsApp}
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Share with friends</p>
              </div>
            </Button>

            {/* Facebook Share */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={shareFacebook}
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Facebook</p>
                <p className="text-xs text-muted-foreground">Share on your timeline</p>
              </div>
            </Button>

            {/* Copy Link */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={copyLink}
            >
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Copy Link</p>
                <p className="text-xs text-muted-foreground">Copy URL to clipboard</p>
              </div>
            </Button>

            {/* Download Image */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={generateShareCard}
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Download Image</p>
                <p className="text-xs text-muted-foreground">Share as Instagram story</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium capitalize text-sm">{value}</p>
      </div>
    </div>
  );
}
