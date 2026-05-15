import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Shield, TrendingUp, Phone, Mail, Instagram } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — MyRideNepal" },
      { name: "description", content: "Learn about MyRideNepal, Nepal's trusted bike and scooter marketplace built to solve real problems in the two-wheeler market." }
    ]
  })
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 text-secondary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About MyRideNepal</h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Nepal's trusted bike and scooter marketplace
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              MyRideNepal was built to solve a real problem in Nepal's two-wheeler market. Buying or selling a bike in Nepal has always meant dealing with fake listings, unclear prices, and zero buyer protection. We built MyRideNepal to change that. Our platform gives buyers and sellers a clean, verified, and trustworthy place to connect directly — no middlemen, no hidden fees, just honest transactions.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free Listings */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Free Listings</h3>
              <p className="text-muted-foreground">
                Any individual can list their bike for free with no commission taken.
              </p>
            </Card>

            {/* Verified Sellers */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Sellers</h3>
              <p className="text-muted-foreground">
                Our admin team reviews every listing before it goes live.
              </p>
            </Card>

            {/* Price Estimator */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Price Estimator</h3>
              <p className="text-muted-foreground">
                Our built-in price tool helps buyers and sellers agree on fair market value.
              </p>
            </Card>

            {/* Direct Contact */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct Contact</h3>
              <p className="text-muted-foreground">
                Buyers connect directly with sellers via phone and WhatsApp.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Team</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              MyRideNepal is an independent marketplace built by a small team passionate about Nepal's bike culture. We are based between Kathmandu and the UK and are committed to building Nepal's most trusted vehicle marketplace.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a 
                href="mailto:hello@myridenepal.com" 
                className="flex items-center gap-3 px-6 py-3 bg-card rounded-lg hover:shadow-md transition-shadow border"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium">hello@myridenepal.com</span>
              </a>
              <a 
                href="https://www.instagram.com/myridenepal/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-card rounded-lg hover:shadow-md transition-shadow border"
              >
                <Instagram className="w-5 h-5 text-primary" />
                <span className="font-medium">@myridenepal</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
