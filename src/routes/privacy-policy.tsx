import { createFileRoute } from "@tanstack/react-router";
import { Shield, Database, Share2, Cookie, UserCheck, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — MyRideNepal" },
      { name: "description", content: "MyRideNepal's privacy policy explaining how we collect, use, and protect your personal information." }
    ]
  })
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
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
            
            {/* Introduction */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MyRideNepal operated at myridenepal.com is committed to protecting your privacy. This policy explains what information we collect and how we use it.
              </p>
            </Card>

            {/* Information We Collect */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We collect the following types of information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Name and email address</strong> when you register</li>
                  <li><strong>Phone number and WhatsApp number</strong> when you create a listing</li>
                  <li><strong>Listing details</strong> including photos and descriptions</li>
                  <li><strong>Usage data</strong> such as pages visited and searches performed</li>
                </ul>
              </div>
            </Card>

            {/* How We Use Your Information */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary" />
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>To display your listings to potential buyers</li>
                  <li>To send you notifications about offers and account activity</li>
                  <li>To verify seller identity and maintain platform trust</li>
                  <li>To improve our services</li>
                </ul>
              </div>
            </Card>

            {/* Information Sharing */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Share2 className="w-6 h-6 text-primary" />
                Information Sharing
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p><strong>We do not sell your personal information to third parties.</strong></p>
                <p>Your contact details are only shared with users you choose to contact through the platform.</p>
                <p>We use Supabase for secure data storage. Supabase is SOC 2 Type 2 certified and complies with GDPR requirements.</p>
              </div>
            </Card>

            {/* Cookies */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Cookie className="w-6 h-6 text-primary" />
                Cookies
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use essential cookies to keep you logged in and remember your preferences.</p>
                <p><strong>We do not use advertising cookies.</strong></p>
                <p>You can disable cookies in your browser settings, but this may affect your ability to use certain features of the platform.</p>
              </div>
            </Card>

            {/* Your Rights */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-primary" />
                Your Rights
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You can <strong>request deletion</strong> of your account and data by emailing hello@myridenepal.com</li>
                  <li>You can <strong>edit or remove</strong> your listings at any time from your dashboard</li>
                  <li>You can <strong>request a copy</strong> of all data we hold about you</li>
                  <li>You can <strong>opt out</strong> of non-essential communications</li>
                </ul>
              </div>
            </Card>

            {/* Contact */}
            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Us
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
              <p>This Privacy Policy was last updated in <strong>May 2026</strong></p>
              <p className="mt-2">MyRideNepal reserves the right to update this policy at any time. Changes will be posted on this page.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
