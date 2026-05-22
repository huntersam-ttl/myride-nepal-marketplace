import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Users, Plus, Loader2, Mail, Phone, Trash2, Edit, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dealer/dashboard/settings/team")({
  component: TeamManagementPage,
});

function TeamManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState<"sales_staff" | "listing_manager">("sales_staff");
  const [removeStaffId, setRemoveStaffId] = useState<string | null>(null);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>("");

  // Get dealer profile
  const { data: dealerProfile, isLoading: dealerLoading } = useQuery({
    queryKey: ["dealer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("dealer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Check if user is owner
  const { data: isOwner = false, isLoading: roleLoading } = useQuery({
    queryKey: ["is-dealer-owner", dealerProfile?.id, user?.id],
    queryFn: async () => {
      if (!dealerProfile || !user) return false;
      const { data } = await (supabase as any)
        .from("dealer_staff")
        .select("role")
        .eq("dealer_id", dealerProfile.id)
        .eq("user_id", user.id)
        .eq("role", "owner")
        .eq("status", "active")
        .maybeSingle();
      return !!data;
    },
    enabled: !!dealerProfile && !!user,
  });

  // Get all staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ["dealer-staff", dealerProfile?.id],
    queryFn: async () => {
      if (!dealerProfile) return [];
      const { data } = await (supabase as any)
        .from("dealer_staff")
        .select(`
          *,
          user:user_id (
            email
          ),
          inviter:invited_by (
            email
          )
        `)
        .eq("dealer_id", dealerProfile.id)
        .neq("status", "removed")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!dealerProfile,
  });

  // Invite staff mutation
  const inviteMutation = useMutation({
    mutationFn: async () => {
      if (!dealerProfile || !user) throw new Error("Not authenticated");
      if (!inviteEmail && !invitePhone) {
        throw new Error("Please provide email or phone number");
      }

      const { error } = await (supabase as any).from("dealer_staff").insert({
        dealer_id: dealerProfile.id,
        invited_email: inviteEmail || null,
        invited_phone: invitePhone || null,
        role: inviteRole,
        status: "pending",
        invited_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff member invited! Share the invite details with them.");
      setInviteOpen(false);
      setInviteEmail("");
      setInvitePhone("");
      setInviteRole("sales_staff");
      queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to invite staff member");
    },
  });

  // Remove staff mutation
  const removeMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await (supabase as any)
        .from("dealer_staff")
        .update({ status: "removed" })
        .eq("id", staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff member removed successfully");
      setRemoveStaffId(null);
      queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove staff member");
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ staffId, newRole }: { staffId: string; newRole: string }) => {
      const { error } = await (supabase as any)
        .from("dealer_staff")
        .update({ role: newRole })
        .eq("id", staffId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff role updated successfully");
      setEditStaffId(null);
      setEditRole("");
      queryClient.invalidateQueries({ queryKey: ["dealer-staff"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update staff role");
    },
  });

  const handleInvite = () => {
    inviteMutation.mutate();
  };

  const handleRemove = (staffId: string) => {
    // Check if trying to remove the only owner
    const ownerCount = staffMembers.filter(
      (s: any) => s.role === "owner" && s.status === "active"
    ).length;
    const isRemovingOwner = staffMembers.find((s: any) => s.id === staffId)?.role === "owner";

    if (ownerCount === 1 && isRemovingOwner) {
      toast.error("Cannot remove the only owner. Add another owner first.");
      return;
    }

    setRemoveStaffId(staffId);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      owner: "default",
      sales_staff: "secondary",
      listing_manager: "outline",
    };
    return (
      <Badge variant={variants[role] || "secondary"} className="capitalize">
        {role.replace("_", " ")}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="default">Active</Badge>;
    if (status === "pending") return <Badge variant="outline">Pending</Badge>;
    return <Badge variant="destructive">Removed</Badge>;
  };

  if (dealerLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          Only dealer owners can manage team access.
        </p>
        <Button onClick={() => navigate({ to: "/dealer/dashboard/settings" })}>
          Back to Settings
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Team Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage staff members and their permissions
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Invite a team member by their email or phone number. They'll need to sign up with the same details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">OR</div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+977 98XXXXXXXX"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_staff">Sales Staff</SelectItem>
                    <SelectItem value="listing_manager">Listing Manager</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sales Staff: Manage leads only. Listing Manager: Manage listings only.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Invite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Email/SMS delivery is not yet available. When you invite a staff member,
          share the invite details with them manually so they can sign up with the same email or phone number.
        </p>
      </Card>

      {/* Staff List */}
      {staffLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : staffMembers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
          <p className="text-muted-foreground mb-4">
            Invite staff members to help manage your dealership
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {staffMembers.map((staff: any) => (
            <Card key={staff.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">
                      {staff.user?.email || staff.invited_email || staff.invited_phone || "Unknown"}
                    </h3>
                    {getRoleBadge(staff.role)}
                    {getStatusBadge(staff.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {staff.invited_email && staff.status === "pending" && (
                      <p>Invited via email: {staff.invited_email}</p>
                    )}
                    {staff.invited_phone && staff.status === "pending" && (
                      <p>Invited via phone: {staff.invited_phone}</p>
                    )}
                    {staff.inviter?.email && (
                      <p>Invited by: {staff.inviter.email}</p>
                    )}
                    <p>
                      {staff.status === "active" ? "Joined" : "Invited"}{" "}
                      {formatDistanceToNow(new Date(staff.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {staff.role !== "owner" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditStaffId(staff.id);
                          setEditRole(staff.role);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(staff.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Remove Staff Dialog */}
      <AlertDialog open={!!removeStaffId} onOpenChange={() => setRemoveStaffId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this staff member? They will lose access to the dealer dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeStaffId && removeMutation.mutate(removeStaffId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editStaffId} onOpenChange={() => setEditStaffId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Staff Role</DialogTitle>
            <DialogDescription>
              Update the role for this staff member
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">New Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales_staff">Sales Staff</SelectItem>
                  <SelectItem value="listing_manager">Listing Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaffId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editStaffId && updateRoleMutation.mutate({ staffId: editStaffId, newRole: editRole })
              }
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
