import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { AccessDenied } from "@/components/AccessDenied";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { NEPAL_DISTRICTS } from "@/lib/nepal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dealer/dashboard/settings/profile")({
  component: ProfileEditPage,
});

function ProfileEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canManageProfile, isLoading: accessLoading, dealerProfile } = useDealerAccess();

  const [formData, setFormData] = useState({
    business_name: "",
    slug: "",
    description: "",
    district: "",
    location: "",
    phone: "",
    whatsapp: "",
    logo_url: "",
    banner_url: "",
    brands_carried: "",
    service_areas: "",
    facebook_url: "",
    tiktok_url: "",
    youtube_url: "",
    instagram_url: "",
    opening_hours: "",
    exchange_accepted: false,
    financing_available: false,
    service_centre: false,
    years_in_business: "",
  });

  // Load dealer profile data
  useEffect(() => {
    if (dealerProfile) {
      setFormData({
        business_name: dealerProfile.business_name || "",
        slug: dealerProfile.slug || "",
        description: dealerProfile.description || "",
        district: dealerProfile.district || "",
        location: dealerProfile.location || "",
        phone: dealerProfile.phone || "",
        whatsapp: dealerProfile.whatsapp || "",
        logo_url: dealerProfile.logo_url || "",
        banner_url: dealerProfile.banner_url || "",
        brands_carried: dealerProfile.brands_carried || "",
        service_areas: dealerProfile.service_areas || "",
        facebook_url: dealerProfile.facebook_url || "",
        tiktok_url: dealerProfile.tiktok_url || "",
        youtube_url: dealerProfile.youtube_url || "",
        instagram_url: dealerProfile.instagram_url || "",
        opening_hours: dealerProfile.opening_hours || "",
        exchange_accepted: dealerProfile.exchange_accepted || false,
        financing_available: dealerProfile.financing_available || false,
        service_centre: dealerProfile.service_centre || false,
        years_in_business: dealerProfile.years_in_business?.toString() || "",
      });
    }
  }, [dealerProfile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!dealerProfile) throw new Error("No dealer profile found");

      const { error } = await supabase
        .from("dealer_profiles")
        .update({
          business_name: formData.business_name,
          slug: formData.slug,
          description: formData.description,
          district: formData.district,
          location: formData.location,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          logo_url: formData.logo_url || null,
          banner_url: formData.banner_url || null,
          brands_carried: formData.brands_carried || null,
          service_areas: formData.service_areas || null,
          facebook_url: formData.facebook_url || null,
          tiktok_url: formData.tiktok_url || null,
          youtube_url: formData.youtube_url || null,
          instagram_url: formData.instagram_url || null,
          opening_hours: formData.opening_hours || null,
          exchange_accepted: formData.exchange_accepted,
          financing_available: formData.financing_available,
          service_centre: formData.service_centre,
          years_in_business: formData.years_in_business ? parseInt(formData.years_in_business) : null,
        })
        .eq("id", dealerProfile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dealer-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManageProfile) {
    return (
      <AccessDenied
        message="Only dealer owners can edit the profile. Contact your manager if changes are needed."
        backTo="/dealer/dashboard/settings"
        backLabel="Back to Settings"
      />
    );
  }

  if (!dealerProfile) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold mb-2">No Dealer Profile</h2>
        <p className="text-muted-foreground mb-4">
          You need to create a dealer profile first.
        </p>
        <Button onClick={() => navigate({ to: "/dealer-signup" })}>
          Create Dealer Profile
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="h-8 w-8" />
          Edit Dealer Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Update your business information and contact details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="my-dealer-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe your dealership..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_in_business">Years in Business</Label>
              <Input
                id="years_in_business"
                type="number"
                value={formData.years_in_business}
                onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Select value={formData.district} onValueChange={(v) => setFormData({ ...formData, district: v })}>
                <SelectTrigger id="district">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {NEPAL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Full Address *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="e.g., Thamel, Ward 26"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_areas">Service Areas</Label>
              <Input
                id="service_areas"
                value={formData.service_areas}
                onChange={(e) => setFormData({ ...formData, service_areas: e.target.value })}
                placeholder="e.g., Kathmandu Valley, Pokhara"
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Images</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner_url">Banner URL</Label>
              <Input
                id="banner_url"
                value={formData.banner_url}
                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>
          </div>
        </Card>

        {/* Business Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Details</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="brands_carried">Brands Carried</Label>
              <Input
                id="brands_carried"
                value={formData.brands_carried}
                onChange={(e) => setFormData({ ...formData, brands_carried: e.target.value })}
                placeholder="e.g., Hero, Honda, Yamaha"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_hours">Opening Hours</Label>
              <Input
                id="opening_hours"
                value={formData.opening_hours}
                onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                placeholder="e.g., Sun-Fri: 9AM-6PM"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="exchange_accepted" className="cursor-pointer">
                  Accept Exchange
                </Label>
                <Switch
                  id="exchange_accepted"
                  checked={formData.exchange_accepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, exchange_accepted: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="financing_available" className="cursor-pointer">
                  Financing Available
                </Label>
                <Switch
                  id="financing_available"
                  checked={formData.financing_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, financing_available: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="service_centre" className="cursor-pointer">
                  Service Centre Available
                </Label>
                <Switch
                  id="service_centre"
                  checked={formData.service_centre}
                  onCheckedChange={(checked) => setFormData({ ...formData, service_centre: checked })}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Social Media</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/your-profile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_url">TikTok URL</Label>
              <Input
                id="tiktok_url"
                value={formData.tiktok_url}
                onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                placeholder="https://tiktok.com/@your-profile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@your-channel"
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/dealer/dashboard/settings" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
