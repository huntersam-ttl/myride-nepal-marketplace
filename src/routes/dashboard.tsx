import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VerificationBadge } from "@/components/VerificationBadge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNPR } from "@/lib/nepal";
import { Loader2, Plus, Trash2, Pencil, Eye, Tag, Clock, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { calculateListingScore } from "@/utils/listingScore";
import { getRecentlyViewed, clearRecentlyViewed } from "@/utils/recentlyViewed";
import { ListingCard } from "@/components/ListingCard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — MyRideNepal" }] }),
});

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => getRecentlyViewed());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/dashboard" } as any });
  }, [user, loading]);

  // Fetch user profile with verification info
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("verification_level, id_document_url, verification_requested_at, verification_approved_at")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Count sold listings for trusted status
  const { data: soldCount } = useQuery({
    queryKey: ["sold-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("status", "sold");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: listings, refetch } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings").select("*").eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending received offers count
  const { data: pendingOffersCount } = useQuery({
    queryKey: ["pending-offers-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user!.id)
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  if (loading || !user) return (
    <div className="container mx-auto py-20 text-center">
      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
    </div>
  );

  const remove = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    refetch();
  };

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setRecentlyViewed([]);
    toast.success("Recently viewed history cleared");
  };

  const statusVariant = (status: string) => {
    if (status === "active") return "default";
    if (status === "pending") return "secondary";
    if (status === "sold") return "outline";
    return "destructive";
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG) or PDF file");
      return;
    }

    setUploadingDocument(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("verification-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("verification-documents")
        .getPublicUrl(fileName);

      // Update profile with document URL and request timestamp
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          id_document_url: publicUrl,
          verification_requested_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Your verification request has been submitted. Our team will review it within 24 hours.");
      refetchProfile();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploadingDocument(false);
    }
  };

  const activeListings = listings?.filter(l => l.status !== "sold") || [];
  const soldListings = listings?.filter(l => l.status === "sold") || [];
  
  // Calculate total earnings from sold listings
  const totalEarnings = soldListings.reduce((sum, listing) => {
    return sum + (listing.sold_price || 0);
  }, 0);

  const verificationLevel = profile?.verification_level || "basic";
  const isPending = profile?.verification_requested_at && !profile?.verification_approved_at;
  const isTrusted = verificationLevel === "trusted";
  const isVerified = verificationLevel === "verified";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My listings</h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <Button onClick={() => navigate({ to: "/sell" })} className="gap-2">
          <Plus className="w-4 h-4" /> New listing
        </Button>
      </div>

      {/* Account Verification Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Account Verification</h2>
        
        {/* Current Level */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Current verification level</p>
          <VerificationBadge verification_level={verificationLevel as any} />
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between max-w-md">
            {/* Basic */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                verificationLevel === "basic" || verificationLevel === "verified" || verificationLevel === "trusted"
                  ? "bg-primary border-primary text-white"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {verificationLevel !== "basic" ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <p className="text-xs mt-2 text-center font-medium">Basic</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              verificationLevel === "verified" || verificationLevel === "trusted" ? "bg-primary" : "bg-muted-foreground/20"
            }`} />
            {/* Verified */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                verificationLevel === "verified" || verificationLevel === "trusted"
                  ? "bg-primary border-primary text-white"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {verificationLevel === "trusted" ? <CheckCircle className="w-5 h-5" /> : "2"}
              </div>
              <p className="text-xs mt-2 text-center font-medium">Verified</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              verificationLevel === "trusted" ? "bg-primary" : "bg-muted-foreground/20"
            }`} />
            {/* Trusted */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                verificationLevel === "trusted"
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}>
                {verificationLevel === "trusted" ? <CheckCircle className="w-5 h-5" /> : "3"}
              </div>
              <p className="text-xs mt-2 text-center font-medium">Trusted</p>
            </div>
          </div>
        </div>

        {/* Next Level Requirements */}
        {verificationLevel === "basic" && !isPending && (
          <Card className="p-4 border-blue-200 bg-blue-50/50">
            <h3 className="font-semibold text-lg mb-3">Get Verified</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Upload a government ID such as citizenship card or passport
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Your ID will be reviewed by the MyRideNepal team within 24 hours
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                Once approved, you will receive a Verified badge on all your listings
              </li>
            </ul>
            <Button 
              className="gap-2" 
              disabled={uploadingDocument}
              onClick={() => document.getElementById("id-upload")?.click()}
            >
              {uploadingDocument ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload ID Document
                </>
              )}
            </Button>
            <input
              id="id-upload"
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
              onChange={handleDocumentUpload}
            />
          </Card>
        )}

        {isPending && (
          <Card className="p-4 border-yellow-200 bg-yellow-50/50">
            <div className="flex items-center gap-3">
              <Clock className="w-10 h-10 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-lg">Your verification is being reviewed</h3>
                <p className="text-sm text-muted-foreground">We will notify you once approved.</p>
              </div>
            </div>
          </Card>
        )}

        {isVerified && !isTrusted && (
          <Card className="p-4 border-amber-200 bg-amber-50/50">
            <h3 className="font-semibold text-lg mb-3">Reach Trusted Status</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Complete <strong>3 or more successful sales</strong> on MyRideNepal. Trusted status is awarded automatically once you reach this milestone.
            </p>
            <p className="text-sm font-semibold mt-3">
              Your progress: <span className="text-amber-700">{soldCount || 0} / 3 sales</span>
            </p>
          </Card>
        )}

        {isTrusted && (
          <Card className="p-4 border-amber-200 bg-amber-50/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Congratulations! You're a Trusted Seller</h3>
                <p className="text-sm text-muted-foreground">
                  You've completed {soldCount || 0}+ successful sales and earned the highest verification level.
                </p>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {/* Quick Navigation */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/dashboard/offers">
              <Tag className="w-4 h-4" />
              My Offers
              {pendingOffersCount !== undefined && pendingOffersCount > 0 && (
                <Badge className="ml-1 bg-primary text-white">{pendingOffersCount}</Badge>
              )}
            </Link>
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">
            Active & Pending
            {activeListings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeListings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sold">
            Sold
            {soldListings.length > 0 && (
              <Badge variant="secondary" className="ml-2">{soldListings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recently-viewed">
            Recently Viewed
            {recentlyViewed.length > 0 && (
              <Badge variant="secondary" className="ml-2">{recentlyViewed.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeListings.length ? (
            <div className="grid gap-4">
              {activeListings.map(l => {
                const score = calculateListingScore(l);
                const gradeColor = {
                  A: "bg-green-600 text-white border-green-600",
                  B: "bg-blue-600 text-white border-blue-600",
                  C: "bg-orange-600 text-white border-orange-600",
                  D: "bg-red-600 text-white border-red-600",
                }[score.grade];
                
                return (
            <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start hover:shadow-md transition-shadow relative">
              {/* Quality Score Badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`absolute top-2 right-2 w-10 h-10 rounded-full ${gradeColor} flex items-center justify-center font-bold text-sm z-10 cursor-help`}>
                      {score.grade}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-1">Quality Score: {score.score}/100</p>
                    {score.tips.length > 0 && (
                      <p className="text-xs">{score.tips[0]}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Link
                to="/listings/$id"
                params={{ id: l.id }}
                className="w-full sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-muted flex-shrink-0"
              >
                {l.images?.[0]
                  ? <img src={l.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No photo</div>
                }
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-primary transition-colors">
                    {l.title}
                  </Link>
                  <Badge variant={statusVariant(l.status) as any} className="capitalize text-xs">
                    {l.status}
                  </Badge>
                </div>
                <p className="text-primary font-bold text-lg mt-1">{formatNPR(l.price)}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.views ?? 0} views</span>
                  <span>{new Date(l.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {l.status === "pending" && (
                  <p className="text-xs text-muted-foreground mt-1.5 italic">Under review — visible after admin approval</p>
                )}
                {l.status === "rejected" && (
                  <p className="text-xs text-destructive mt-1.5">Rejected — please edit and resubmit</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/listings/$id/edit" params={{ id: l.id }}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>"{l.title}"</strong>. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => remove(l.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No active listings</h3>
              <p className="text-muted-foreground mb-6">Post your first bike or scooter — it's free and takes under 3 minutes.</p>
              <Button onClick={() => navigate({ to: "/sell" })} className="gap-2">
                <Plus className="w-4 h-4" /> Post your first listing
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sold">
          {soldListings.length > 0 && totalEarnings > 0 && (
            <Card className="p-4 mb-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-700">{formatNPR(totalEarnings)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Sold Listings</p>
                  <p className="text-2xl font-bold">{soldListings.length}</p>
                </div>
              </div>
            </Card>
          )}

          {soldListings.length ? (
            <div className="grid gap-4">
              {soldListings.map(l => (
                <Card key={l.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start opacity-75">
                  <Link
                    to="/listings/$id"
                    params={{ id: l.id }}
                    className="w-full sm:w-28 aspect-[4/3] rounded-lg overflow-hidden bg-muted flex-shrink-0 relative"
                  >
                    {l.images?.[0]
                      ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">No photo</div>
                    }
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge className="bg-green-600 text-white font-bold px-2 py-1 text-xs">SOLD</Badge>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-primary transition-colors">
                        {l.title}
                      </Link>
                      <Badge variant="outline" className="capitalize text-xs text-green-700 border-green-600">
                        Sold
                      </Badge>
                    </div>
                    <p className="text-primary font-bold text-lg mt-1">{formatNPR(l.price)}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {l.sold_at && (
                        <span>
                          Sold: {new Date(l.sold_at).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      )}
                      {l.sold_price && (
                        <span className="text-green-700 font-semibold">
                          Sale Price: {formatNPR(l.sold_price)}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {l.views ?? 0} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete listing?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete <strong>"{l.title}"</strong>. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => remove(l.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No sold listings yet</h3>
              <p className="text-muted-foreground">Once you mark a listing as sold, it will appear here.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recently-viewed">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recently Viewed Listings</h3>
            {recentlyViewed.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearHistory}>
                Clear History
              </Button>
            )}
          </div>
          
          {recentlyViewed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentlyViewed.map((listing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing as any} />
                  {listing.status !== "active" && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <div className="bg-white px-4 py-2 rounded-lg font-semibold text-sm">
                        {listing.status === "sold" ? "Sold" : "Unavailable"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">You have not viewed any listings yet</h3>
              <p className="text-muted-foreground mb-6">Start browsing to see your history here</p>
              <Button onClick={() => navigate({ to: "/browse" })} className="gap-2">
                Browse Bikes
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
