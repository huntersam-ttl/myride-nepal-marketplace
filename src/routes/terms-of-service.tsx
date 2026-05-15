import { createFileRoute } from "@tanstack/react-router";
import { FileText, Users, ShieldAlert, XCircle, AlertTriangle, Ban, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
  head: () => ({
    meta: [
      { title: "Terms of Service — MyRideNepal" },
      { name: "description", content: "MyRideNepal's terms of service outlining user responsibilities, prohibited content, and platform usage rules." }
    ]
  })
});

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-lg opacity-90">
              Last updated: May 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Acceptance */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By using MyRideNepal, you agree to these terms of service. If you do not agree to these terms, please do not use our platform.
              </p>
            </Card>

            {/* Platform Role */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Platform Role
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  MyRideNepal is a <strong>listing platform</strong> that connects buyers and sellers of bikes and scooters in Nepal.
                </p>
                <p>
                  <strong>We are not a party to any transaction</strong> between users and take no commission on sales. All transactions occur directly between buyers and sellers.
                </p>
                <p>
                  Our role is to provide the platform for listings and facilitate connections. We do not handle payments, deliveries, or vehicle transfers.
                </p>
              </div>
            </Card>

            {/* User Responsibilities */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-primary" />
                User Responsibilities
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>As a user of MyRideNepal, you agree to the following responsibilities:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide <strong>accurate listing information</strong></li>
                  <li>You must not post <strong>fake or misleading listings</strong></li>
                  <li>You must be the <strong>legal owner</strong> of any vehicle you list</li>
                  <li>You are responsible for <strong>verifying documents</strong> before any purchase</li>
                  <li>You must respond to inquiries in a <strong>timely and honest</strong> manner</li>
                  <li>You must honor the price and condition stated in your listing</li>
                </ul>
              </div>
            </Card>

            {/* Prohibited Content */}
            <Card className="p-8 border-destructive/20 bg-destructive/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-destructive">
                <XCircle className="w-6 h-6" />
                Prohibited Content
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>The following types of listings are <strong>strictly prohibited</strong> on MyRideNepal:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Stolen vehicles</strong></li>
                  <li><strong>Vehicles with outstanding finance</strong> not disclosed</li>
                  <li><strong>Fake or duplicate listings</strong></li>
                  <li><strong>Misleading photos or descriptions</strong></li>
                  <li>Vehicles without proper documentation or registration</li>
                  <li>Listings containing false contact information</li>
                </ul>
                <p className="pt-2 text-destructive font-medium">
                  Violation of these rules will result in immediate listing removal and potential account ban.
                </p>
              </div>
            </Card>

            {/* Liability */}
            <Card className="p-8 border-amber-500/20 bg-amber-500/5">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-amber-700 dark:text-amber-500">
                <AlertTriangle className="w-6 h-6" />
                Liability Disclaimer
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="font-medium">
                  <strong>MyRideNepal is not responsible for transactions between users.</strong>
                </p>
                <p>
                  We strongly recommend that you:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Always verify documents</strong> including bluebook, registration, and tax clearance</li>
                  <li><strong>Inspect vehicles in person</strong> before making any payment</li>
                  <li><strong>Meet in safe, public locations</strong> for test rides and transactions</li>
                  <li><strong>Never transfer money</strong> before completing proper documentation</li>
                  <li><strong>Report suspicious listings</strong> to our admin team</li>
                </ul>
                <p className="pt-2">
                  MyRideNepal provides the platform but cannot guarantee the accuracy of listings or the outcome of transactions. Users engage with each other at their own risk.
                </p>
              </div>
            </Card>

            {/* Account Termination */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Ban className="w-6 h-6 text-primary" />
                Account Termination
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We reserve the right to <strong>remove listings or ban accounts</strong> that violate these terms of service.
                </p>
                <p>
                  Reasons for account termination include but are not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting prohibited content</li>
                  <li>Repeated fake or misleading listings</li>
                  <li>Fraudulent activity</li>
                  <li>Harassment or abusive behavior toward other users</li>
                  <li>Attempting to circumvent platform fees or policies</li>
                </ul>
                <p className="pt-2">
                  Account termination decisions are final and at the sole discretion of MyRideNepal management.
                </p>
              </div>
            </Card>

            {/* Changes to Terms */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                MyRideNepal reserves the right to modify these terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </Card>

            {/* Contact */}
            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>If you have any questions about these Terms of Service, please contact us:</p>
                <a 
                  href="mailto:hello@myridenepal.com" 
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-lg"
                >
                  <Mail className="w-5 h-5" />
                  hello@myridenepal.com
                </a>
              </div>
            </Card>

            {/* Last Updated */}
            <div className="text-center text-sm text-muted-foreground pt-8 border-t">
              <p>These Terms of Service were last updated in <strong>May 2026</strong></p>
              <p className="mt-2">By using MyRideNepal, you acknowledge that you have read and agree to these terms.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
