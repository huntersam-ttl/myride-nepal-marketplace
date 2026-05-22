import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { AccessDenied } from "@/components/AccessDenied";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNPR } from "@/lib/nepal";
import { Loader2, Pencil, Eye, Package, Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dealer/dashboard/inventory")({
  component: InventoryPage,
});

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 border-green-500/20",
  reserved: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  sold: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  draft: "bg-gray-500/10 text-gray-700 border-gray-500/20",
  pending: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

function InventoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { canManageListings, isLoading: accessLoading } = useDealerAccess();
  const queryClient = useQueryClient();
  
  // State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [quickEditPrice, setQuickEditPrice] = useState<string>("");
  const [quickEditStatus, setQuickEditStatus] = useState<string>("");

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManageListings) {
    return (
      <AccessDenied message="Only owners and listing managers can manage inventory. Contact your manager if you need access." />
    );
  }

  // Fetch dealer listings (excluding soft-deleted)
  const { data: listings, isLoading } = useQuery({
    queryKey: ["dealer-inventory", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user!.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  // Duplicate listing mutation
  const duplicateMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const original = listings?.find((l: any) => l.id === listingId);
      if (!original) throw new Error("Listing not found");

      const duplicate: any = {
        user_id: original.user_id,
        title: original.title + " (Copy)",
        brand: original.brand,
        model: original.model,
        year: original.year,
        condition: original.condition,
        fuel_type: original.fuel_type || "petrol",
        bike_type: original.bike_type || "commuter",
        price: original.price,
        mileage: original.mileage || 0,
        colour: original.colour,
        district: original.district,
        description: original.description,
        phone: original.phone,
        whatsapp: original.whatsapp,
        status: "draft",
      };

      // Copy optional fields if they exist
      if (original.engine_cc) duplicate.engine_cc = original.engine_cc;
      if (original.transmission) duplicate.transmission = original.transmission;
      if (original.youtube_url) duplicate.youtube_url = original.youtube_url;
      if (original.dealer_id) duplicate.dealer_id = original.dealer_id;

      const { data, error } = await supabase
        .from("listings")
        .insert(duplicate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dealer-inventory"] });
      toast.success("Listing duplicated as draft");
      // Optional: navigate to edit page
      // navigate({ to: `/listings/${data.id}/edit` });
    },
    onError: (error: any) => {
      toast.error("Failed to duplicate: " + error.message);
    },
  });

  // Bulk status update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (status: string) => {
      const updates: any = { status };
      
      if (status === "sold") {
        updates.sold_at = new Date().toISOString();
      } else if (status !== "sold") {
        updates.sold_at = null;
      }

      const { error } = await supabase
        .from("listings")
        .update(updates)
        .in("id", selectedIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-inventory"] });
      setSelectedIds([]);
      setBulkAction("");
      setShowBulkConfirm(false);
      toast.success(`${selectedIds.length} listings updated`);
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  // Bulk delete mutation (soft delete)
  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("listings")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", selectedIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-inventory"] });
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      toast.success(`${selectedIds.length} listings deleted`);
    },
    onError: (error: any) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  // Quick edit mutation
  const quickEditMutation = useMutation({
    mutationFn: async ({
      id,
      price,
      status,
    }: {
      id: string;
      price?: number;
      status?: string;
    }) => {
      const updates: any = {};
      if (price !== undefined) updates.price = price;
      if (status !== undefined) {
        updates.status = status;
        if (status === "sold") {
          updates.sold_at = new Date().toISOString();
        } else {
          updates.sold_at = null;
        }
      }

      const { error } = await supabase
        .from("listings")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer-inventory"] });
      setEditingListing(null);
      toast.success("Listing updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const handleQuickEdit = () => {
    if (!editingListing) return;

    const updates: any = { id: editingListing.id };
    
    if (quickEditPrice) {
      const price = parseFloat(quickEditPrice);
      if (isNaN(price) || price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      updates.price = price;
    }
    
    if (quickEditStatus && quickEditStatus !== editingListing.status) {
      updates.status = quickEditStatus;
    }

    quickEditMutation.mutate(updates);
  };

  const openQuickEdit = (listing: any) => {
    setEditingListing(listing);
    setQuickEditPrice(listing.price.toString());
    setQuickEditStatus(listing.status);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === listings?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings?.map((l: any) => l.id) || []);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === "delete") {
      setShowDeleteConfirm(true);
    } else {
      setShowBulkConfirm(true);
    }
  };

  const confirmBulkUpdate = () => {
    bulkUpdateMutation.mutate(bulkAction);
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
        <p className="text-muted-foreground mb-6">
          Start building your inventory by creating your first listing.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/sell">Create Listing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dealer/dashboard/inventory/import">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">
            {listings.length} listings total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/dealer/dashboard/inventory/import">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link to="/sell">Create Listing</Link>
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Bulk action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Mark Active</SelectItem>
                <SelectItem value="draft">Mark Draft</SelectItem>
                <SelectItem value="reserved">Mark Reserved</SelectItem>
                <SelectItem value="sold">Mark Sold</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
            >
              Apply
            </Button>
            <Button variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === listings.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing: any) => (
              <TableRow key={listing.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(listing.id)}
                    onCheckedChange={() => toggleSelection(listing.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{listing.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {listing.year} {listing.brand} {listing.model}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatNPR(listing.price)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[listing.status] || ""}>
                    {listing.status}
                  </Badge>
                </TableCell>
                <TableCell>{listing.views_count || listing.views || 0}</TableCell>
                <TableCell>
                  {new Date(listing.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link to={`/listings/${listing.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openQuickEdit(listing)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateMutation.mutate(listing.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Quick Edit Dialog */}
      <Dialog open={!!editingListing} onOpenChange={() => setEditingListing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Edit</DialogTitle>
            <DialogDescription>
              Update price and status for this listing
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (NPR)</Label>
              <Input
                id="price"
                type="number"
                value={quickEditPrice}
                onChange={(e) => setQuickEditPrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={quickEditStatus} onValueChange={setQuickEditStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingListing(null)}>
              Cancel
            </Button>
            <Button onClick={handleQuickEdit} disabled={quickEditMutation.isPending}>
              {quickEditMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Confirmation */}
      <AlertDialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {selectedIds.length} listings as "{bulkAction}"?
              {bulkAction === "sold" && " This will set the sold date."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkUpdate}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} listings?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
