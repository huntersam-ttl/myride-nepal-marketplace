import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, AlertTriangle, CheckCircle, Users, FileText, Bike, Wallet, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/safety-tips")({
  component: SafetyTipsPage,
  head: () => ({ meta: [{ title: "Buyer Safety Tips — MyRideNepal" }] }),
});

function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Stay Safe When Buying a Bike in Nepal</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            MyRideNepal is committed to making every transaction safe and trustworthy
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Safety Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {/* Before You Meet the Seller */}
          <AccordionItem value="before-meeting" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Before You Meet the Seller</h3>
                  <p className="text-sm text-muted-foreground">Research and verify before committing</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Verify Documents Online</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Ask the seller to share photos of the bluebook, registration, and tax clearance</li>
                    <li>Check if the vehicle registration number matches across all documents</li>
                    <li>Verify the engine and chassis numbers are clearly visible and match</li>
                    <li>Confirm the bluebook is in the seller's name (or ask about transfer arrangements)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Check Listing History</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Look at the seller's verification badge (Verified or Trusted sellers are safer)</li>
                    <li>Check if the listing has any reports or warnings</li>
                    <li>Review the seller's other active listings and selling history</li>
                    <li>Be cautious if the seller has multiple similar bikes listed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Research Market Prices</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Browse similar bikes on MyRideNepal to understand fair pricing</li>
                    <li>Use our Price Estimator tool to check market value</li>
                    <li>Be very suspicious if the price is more than 30% below market value</li>
                    <li>Remember: if it seems too good to be true, it probably is</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* At the Meeting */}
          <AccordionItem value="at-meeting" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">At the Meeting</h3>
                  <p className="text-sm text-muted-foreground">Safety precautions during the inspection</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Choose a Safe Location</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Meet in a public place during daytime hours (10 AM - 5 PM recommended)</li>
                    <li>Avoid meeting at the seller's home or secluded areas</li>
                    <li>Good locations: parking lots of shopping malls, near police stations, busy main roads</li>
                    <li>Tell a family member or friend where you're going and when you'll be back</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bring a Companion</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Always bring a friend or family member with you</li>
                    <li>Ideally, bring someone who knows about bikes and can help inspect</li>
                    <li>Have your phone fully charged and keep it accessible</li>
                    <li>Never go alone to meet an unknown seller</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What to Inspect Physically</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Check for signs of accident damage: bent frames, misaligned parts, paint mismatches</li>
                    <li>Look for rust, especially on the chassis and exhaust system</li>
                    <li>Inspect tires for wear and check if they need replacement</li>
                    <li>Test all lights, horn, brakes, and indicators</li>
                    <li>Check for oil leaks under the bike and around the engine</li>
                    <li>Verify the engine and chassis numbers match the bluebook exactly</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Checking the Documents */}
          <AccordionItem value="documents" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Checking the Documents</h3>
                  <p className="text-sm text-muted-foreground">What to look for in official paperwork</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Bluebook (Vehicle Registration Certificate)</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Verify the seller's name matches the bluebook exactly</li>
                    <li>Check if the bluebook is original (not a photocopy)</li>
                    <li>Confirm the vehicle number, engine number, and chassis number all match</li>
                    <li>Look for any endorsements or notes about accidents or modifications</li>
                    <li>If the name doesn't match, get written confirmation about transfer process and costs</li>
                    <li>Never complete a purchase without seeing the original bluebook</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Insurance Documents</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Check the insurance validity date — is it current or expired?</li>
                    <li>Verify the insurance company is legitimate</li>
                    <li>Confirm the policy number and vehicle details match</li>
                    <li>Note: you'll need to transfer or get new insurance after purchase</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tax Clearance Certificate</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Ensure all vehicle taxes are paid up to date</li>
                    <li>Check the receipt or clearance certificate from the tax office</li>
                    <li>Unpaid taxes will become your responsibility after purchase</li>
                    <li>Ask the seller to clear any pending dues before finalizing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registration Expiry</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Check when the registration expires and if renewal is needed soon</li>
                    <li>Factor in renewal costs if it's expiring soon</li>
                    <li>Make sure there are no penalties or fines pending</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* The Test Ride */}
          <AccordionItem value="test-ride" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bike className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">The Test Ride</h3>
                  <p className="text-sm text-muted-foreground">Mechanical checks during the ride</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Safety First</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Wear a helmet during the test ride — never ride without one</li>
                    <li>Start with a short ride in a controlled area (parking lot or quiet street)</li>
                    <li>Make sure you're comfortable with the bike's size and weight</li>
                    <li>Don't test ride in heavy traffic if you're unfamiliar with the bike</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What to Listen For</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Strange engine noises: knocking, rattling, or excessive vibration</li>
                    <li>Unusual sounds from the exhaust (could indicate damage)</li>
                    <li>Grinding or squealing brakes (needs immediate attention)</li>
                    <li>Chain noise or clicking (may need adjustment or replacement)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">What to Feel For</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Smooth gear changes — clutch should engage smoothly without slipping</li>
                    <li>Responsive brakes — both front and rear should feel firm</li>
                    <li>Straight tracking — bike shouldn't pull to one side</li>
                    <li>Stable handling — no wobbling or shaking at higher speeds</li>
                    <li>Good suspension — absorbs bumps without bottoming out</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After the Ride</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Check for new oil leaks after the engine has warmed up</li>
                    <li>Inspect the exhaust for excessive smoke (blue = oil burning, white = coolant leak)</li>
                    <li>If possible, have a trusted mechanic inspect the bike before finalizing</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Making the Payment */}
          <AccordionItem value="payment" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Making the Payment</h3>
                  <p className="text-sm text-muted-foreground">Protect yourself during the transaction</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Critical Rule: Never pay the full amount before receiving documents
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Payment Best Practices</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Pay a small advance only if absolutely necessary (maximum 10-20% of total price)</li>
                    <li>Make the final payment only after receiving original documents in hand</li>
                    <li>Use bank transfer or mobile banking for traceability (avoid large cash amounts)</li>
                    <li>If paying cash, count the money carefully in front of the seller</li>
                    <li>Never send payment before seeing the bike in person</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Get a Written Receipt</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Always get a written receipt with the date, amount, and seller's signature</li>
                    <li>Include vehicle details: registration number, make, model, year</li>
                    <li>Have the seller write "Full payment received" on the receipt</li>
                    <li>Keep the receipt until the bluebook is transferred to your name</li>
                    <li>Take photos of all documents and receipts for your records</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Common Scams to Avoid</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Seller asks for full payment before providing documents ("documents are with loan company")</li>
                    <li>Pressure to complete transaction quickly ("another buyer is coming soon")</li>
                    <li>Bluebook is "being processed" or "will be ready next week"</li>
                    <li>Seller disappears after receiving advance payment</li>
                    <li>Documents turn out to be fake or forged after payment</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* After the Purchase */}
          <AccordionItem value="after-purchase" className="bg-card border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">After the Purchase</h3>
                  <p className="text-sm text-muted-foreground">Complete the legal transfer process</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6 space-y-3 text-sm leading-relaxed">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Transfer the Bluebook Immediately</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Visit the Department of Transport Management (Yatayat) office within 7 days</li>
                    <li>Bring: Original bluebook, seller's citizenship, your citizenship, sale deed</li>
                    <li>Pay the transfer fee and get the bluebook in your name</li>
                    <li>Until transfer is complete, any fines or accidents are the previous owner's legal responsibility</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Update Insurance</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Transfer the existing insurance to your name, or get new insurance</li>
                    <li>Third-party insurance is mandatory by law in Nepal</li>
                    <li>Consider comprehensive insurance for better coverage</li>
                    <li>Shop around for competitive rates from different insurance companies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Register in Your Name</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Complete the registration process at the Yatayat office</li>
                    <li>Update your address on the registration if needed</li>
                    <li>Keep copies of all transfer documents for your records</li>
                    <li>Update the insurance and tax records with your new ownership</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">First Service and Maintenance</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Get a full service done by a trusted mechanic within the first week</li>
                    <li>Change the engine oil, check all fluid levels, adjust chain tension</li>
                    <li>Replace any worn parts (brakes, tires, lights) for safety</li>
                    <li>Keep maintenance records for future reference and resale value</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA Box */}
        <Card className="p-8 mt-12 bg-primary/5 border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Trust Your Instincts</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              If something feels wrong, trust your instincts and walk away. There are always more bikes available. 
              Report suspicious listings using the <strong>Report</strong> button on any listing page, 
              and our team will investigate within 24 hours.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/browse">
                <CheckCircle className="w-5 h-5" />
                Browse Safe Listings
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
