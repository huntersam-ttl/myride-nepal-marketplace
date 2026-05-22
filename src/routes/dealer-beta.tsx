import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Phone,
  LayoutDashboard,
  Share2,
  BarChart3,
  Store,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dealer-beta")({
  component: DealerBetaPage,
  head: () => ({
    meta: [
      { title: "Dealer Beta — Grow your showroom online with MyRideNepal" },
      {
        name: "description",
        content:
          "Join our 3-month free beta for bike and scooter dealers across Nepal. List inventory, get direct buyer contacts, and promote your showroom — no commission.",
      },
    ],
  }),
});

const BENEFITS = [
  { icon: CheckCircle2, title: "Unlimited listings during beta", desc: "List as many bikes and scooters as you want for the full 3 months." },
  { icon: CheckCircle2, title: "No commission", desc: "Keep 100% of every sale — we don't take a cut of your deals." },
  { icon: MessageCircle, title: "Direct WhatsApp and phone leads", desc: "Buyers contact you directly. No middleman, no markup." },
  { icon: Store, title: "Dealer profile page", desc: "Your own showroom page with banner, logo, brands, and location." },
  { icon: LayoutDashboard, title: "Inventory dashboard", desc: "Manage all your listings from one clean dashboard." },
  { icon: Share2, title: "Share-ready listing cards", desc: "One-tap share cards for WhatsApp, Facebook and Instagram." },
  { icon: BarChart3, title: "Analytics and lead tracking", desc: "See profile views, listing views, and incoming leads in real time." },
  { icon: ShieldCheck, title: "Verified dealer badge after review", desc: "Stand out with a verified badge once our team confirms your showroom." },
];

const STEPS = [
  { n: "1", title: "Create dealer profile", desc: "Sign up and tell us about your showroom." },
  { n: "2", title: "Add showroom details", desc: "Add your logo, banner, brands, location and opening hours." },
  { n: "3", title: "Upload / list your bikes", desc: "Add inventory one by one or in bulk." },
  { n: "4", title: "Get reviewed by MyRideNepal", desc: "We check your showroom and award the verified badge." },
  { n: "5", title: "Start receiving buyer contacts", desc: "Buyers reach you on WhatsApp or phone — you take it from there." },
];

const CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Chitwan",
  "Butwal",
  "Biratnagar",
  "Dharan",
  "Nepalgunj",
  "Hetauda",
  "Itahari",
  "Janakpur",
];

const TRUST = [
  { title: "Built for Nepal's two-wheeler market", desc: "Designed specifically for how bikes and scooters are bought and sold in Nepal." },
  { title: "Buyers contact you directly", desc: "WhatsApp and phone — the channels Nepali buyers already use." },
  { title: "No online payment through MyRideNepal", desc: "Deals are handled offline between you and the buyer. We don't touch the money." },
  { title: "You stay in control of your deals", desc: "Set your prices, choose who you respond to, close the way you want." },
];

const FAQ = [
  {
    q: "Is it free?",
    a: "Yes. The dealer beta is completely free for the first 3 months — no setup fee, no listing fee, no hidden charges.",
  },
  {
    q: "Do I need to pay commission?",
    a: "No. We don't take any commission on sales. Every rupee from the deal goes to you.",
  },
  {
    q: "Can dealers outside Kathmandu join?",
    a: "Yes. The beta is open to dealers across all 77 districts of Nepal — Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj, Hetauda, Itahari, Janakpur and everywhere else included.",
  },
  {
    q: "Can I list used and new bikes?",
    a: "Yes. You can list both used and new bikes and scooters from your showroom.",
  },
  {
    q: "Can I add my staff?",
    a: "Yes. You can invite staff members to manage listings and respond to leads from your dealer dashboard.",
  },
  {
    q: "What happens after 3 months?",
    a: "We'll share pricing options well before your beta period ends. You'll never be charged without your explicit consent.",
  },
  {
    q: "How do buyers contact me?",
    a: "Buyers contact you directly through WhatsApp or phone — the contact details you set on your dealer profile. No messages go through MyRideNepal first.",
  },
];

function DealerBetaPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(232,75,26,0.4), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,75,26,0.25), transparent 50%)",
          }}
        />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide uppercase mb-5">
              🇳🇵 Dealer Beta — 3 months free
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
              Grow your showroom online with MyRideNepal
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Join our 3-month free beta for bike and scooter dealers across Nepal.
              List inventory, get direct buyer contacts, track leads, and promote your showroom — no commission.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="text-base gap-2">
                <Link to="/dealer-signup">
                  Join free beta <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">No commission • No setup fee • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">What you get during the beta</h2>
          <p className="text-muted-foreground mt-2">Everything a Nepal-based dealer needs to sell more bikes online.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="p-5 shadow-[var(--shadow-card)]">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-2">From signup to your first lead in five steps.</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {STEPS.map((s) => (
              <Card key={s.n} className="p-5 text-center shadow-[var(--shadow-card)]">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-3">
                  {s.n}
                </div>
                <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nepal-wide */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">Open to dealers across all of Nepal</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We're rolling the beta out nationwide. If you have a showroom anywhere in Nepal, you're invited.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 justify-center">
            {CITIES.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 rounded-full border bg-card text-sm font-medium"
              >
                {c}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full border bg-muted text-sm font-medium text-muted-foreground">
              + all other districts and cities
            </span>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why dealers trust MyRideNepal</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {TRUST.map((t) => (
              <Card key={t.title} className="p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{t.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-base">
                  <span>{item.q}</span>
                  <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-8 md:p-12 text-center text-white shadow-[var(--shadow-elegant)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">
            Ready to grow your showroom online?
          </h2>
          <p className="mt-4 text-base md:text-lg text-white/90 max-w-2xl mx-auto">
            Join the dealer beta today. 3 months free, no commission, no commitment.
          </p>
          <div className="mt-7 flex justify-center">
            <Button asChild size="lg" className="text-base bg-white text-secondary font-semibold hover:bg-white/90 border-0 gap-2">
              <Link to="/dealer-signup">
                Join free beta <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
