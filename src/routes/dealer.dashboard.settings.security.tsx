import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useDealerAccess } from "@/hooks/use-dealer-access";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Key, Smartphone, Users, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dealer/dashboard/settings/security")({
  component: SecuritySettingsPage,
});

function SecuritySettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dealerProfile, role, isLoading: accessLoading } = useDealerAccess();

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dealerProfile) {
    return (
      <Card className="p-12 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
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
          <Shield className="h-8 w-8" />
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security and access
        </p>
      </div>

      {/* Account Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-sm text-muted-foreground">{user?.email || "Not available"}</p>
            </div>
            <Badge variant="secondary">Verified</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Role in Dealership</p>
              <p className="text-sm text-muted-foreground capitalize">
                {role?.replace("_", " ") || "Unknown"}
              </p>
            </div>
            <Badge variant="default" className="capitalize">
              {role?.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Team Access Warning */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Team Access Security</h3>
            <p className="text-sm text-amber-800 mb-2">
              Only invite staff members you trust. Team members with access can:
            </p>
            <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
              <li><strong>Owners:</strong> Full access to all dealership features</li>
              <li><strong>Listing Managers:</strong> Manage all listings and inventory</li>
              <li><strong>Sales Staff:</strong> View and respond to customer leads</li>
            </ul>
            <p className="text-sm text-amber-800 mt-3">
              You can remove team members at any time from the Team Access page.
            </p>
          </div>
        </div>
      </Card>

      {/* Password & Authentication */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <Key className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Change Password</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Update your password to keep your account secure
              </p>
              <Button variant="outline" disabled>
                <Key className="w-4 h-4 mr-2" />
                Change Password
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <Smartphone className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add an extra layer of security to your account with 2FA
              </p>
              <Button variant="outline" disabled>
                <Smartphone className="w-4 h-4 mr-2" />
                Enable 2FA
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <Users className="w-6 h-6 text-muted-foreground mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-1">Active Sessions</h4>
              <p className="text-sm text-muted-foreground mb-3">
                View and manage devices where you're currently logged in
              </p>
              <Button variant="outline" disabled>
                <Users className="w-4 h-4 mr-2" />
                Manage Sessions
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Note */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Password management, two-factor authentication, and session management
          will be available in a future update. For now, you can manage basic account security through
          your Supabase authentication settings.
        </p>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/dealer/dashboard/settings" })}
        >
          Back to Settings
        </Button>
      </div>
    </div>
  );
}
