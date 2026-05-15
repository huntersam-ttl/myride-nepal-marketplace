import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface BuyerSafetyChecklistProps {
  listing: any;
}

// Base market prices by brand (same as fake listing detection)
const BASE_MARKET_PRICES: Record<string, number> = {
  "Hero": 150000,
  "Honda": 250000,
  "Yamaha": 280000,
  "Bajaj": 180000,
  "TVS": 160000,
  "Suzuki": 200000,
  "KTM": 350000,
  "Royal Enfield": 280000,
  "Pulsar": 180000,
  "Apache": 160000,
};

interface ChecklistItem {
  id: string;
  text: string;
  highlight?: "orange" | "red";
  condition?: boolean;
}

export function BuyerSafetyChecklist({ listing }: BuyerSafetyChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // Load checked items from localStorage on mount
  useEffect(() => {
    const storageKey = `safety-checklist-${listing.id}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCheckedItems(new Set(parsed));
      } catch (e) {
        console.error("Error loading checklist state:", e);
      }
    }
  }, [listing.id]);

  // Save checked items to localStorage whenever they change
  useEffect(() => {
    const storageKey = `safety-checklist-${listing.id}`;
    localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
  }, [checkedItems, listing.id]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Calculate safety risk level
  const calculateRiskLevel = (): "low" | "medium" | "high" => {
    const verificationLevel = listing.verification_level || "basic";
    const isVerified = verificationLevel === "verified" || verificationLevel === "trusted";
    const hasBluebook = listing.has_bluebook === true;
    const noAccident = listing.accident_history === false;
    const reportCount = (listing as any).report_count || 0;
    
    const basePrice = BASE_MARKET_PRICES[listing.brand] || 200000;
    const priceRatio = listing.price / basePrice;
    const isPriceReasonable = priceRatio >= 0.8 && priceRatio <= 1.2;

    // High Risk conditions
    if (reportCount >= 1) return "high";
    if (priceRatio < 0.7) return "high"; // Price more than 30% below market
    if (listing.accident_history === true) return "high";
    if (!listing.has_bluebook && !listing.has_insurance && !listing.has_tax_clearance && !listing.has_registration) {
      return "high"; // No documents at all
    }

    // Low Risk conditions
    if (isVerified && hasBluebook && noAccident && isPriceReasonable && reportCount === 0) {
      return "low";
    }

    // Otherwise Medium Risk
    return "medium";
  };

  const riskLevel = calculateRiskLevel();
  const reportCount = (listing as any).report_count || 0;
  const basePrice = BASE_MARKET_PRICES[listing.brand] || 200000;
  const priceRatio = listing.price / basePrice;
  const verificationLevel = listing.verification_level || "basic";

  // Build checklist items
  const alwaysCheckItems: ChecklistItem[] = [
    { id: "verify-id", text: "Verify the seller identity by asking for their ID" },
    { id: "inspect-person", text: "Inspect the bike in person before agreeing to buy" },
    { id: "check-numbers", text: "Check engine number and chassis number match the bluebook" },
    { id: "test-ride", text: "Take the bike for a test ride" },
    { id: "mechanic-inspect", text: "Have a mechanic inspect the bike" },
    { id: "public-place", text: "Meet in a public place during daytime" },
    { id: "no-full-payment", text: "Never pay full amount before receiving documents" },
  ];

  const conditionalItems: ChecklistItem[] = [];

  if (listing.has_bluebook === false || listing.has_bluebook === null || listing.has_bluebook === undefined) {
    conditionalItems.push({
      id: "confirm-bluebook",
      text: "Confirm the seller can obtain the bluebook before purchase",
      highlight: "orange",
      condition: true,
    });
  }

  if (listing.has_bluebook === true && listing.bluebook_name_match === false) {
    conditionalItems.push({
      id: "verify-transfer",
      text: "Verify the bluebook name transfer process and associated costs",
      highlight: "orange",
      condition: true,
    });
  }

  if (listing.accident_history === true) {
    conditionalItems.push({
      id: "accident-assessment",
      text: "Get an independent assessment of accident repairs",
      highlight: "red",
      condition: true,
    });
  }

  if (reportCount >= 1) {
    conditionalItems.push({
      id: "reported-listing",
      text: "This listing has been reported — proceed with extra caution",
      highlight: "red",
      condition: true,
    });
  }

  if (priceRatio < 0.7) {
    conditionalItems.push({
      id: "unusually-low-price",
      text: "The price seems unusually low — verify there is no loan or legal issue on the bike",
      highlight: "red",
      condition: true,
    });
  }

  if (verificationLevel === "basic") {
    conditionalItems.push({
      id: "seller-verification",
      text: "Consider asking the seller to verify their identity through MyRideNepal",
      highlight: "orange",
      condition: true,
    });
  }

  const allItems = [...alwaysCheckItems, ...conditionalItems.filter(item => item.condition)];
  const checkedCount = allItems.filter(item => checkedItems.has(item.id)).length;
  const totalCount = allItems.length;
  const completionPercentage = Math.round((checkedCount / totalCount) * 100);
  const safetyReadinessScore = completionPercentage;

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="text-xl font-bold">Buyer Safety Checklist</h2>
            {riskLevel === "low" && (
              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                Low Risk
              </Badge>
            )}
            {riskLevel === "medium" && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
                Moderate Risk
              </Badge>
            )}
            {riskLevel === "high" && (
              <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 gap-1">
                <AlertTriangle className="w-3 h-3" />
                Higher Risk — Extra Caution
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Follow these steps before making any payment · <Link to="/safety-tips" className="text-primary hover:underline">Learn more</Link>
          </p>
        </div>
      </div>

      {/* Safety Readiness Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Safety Readiness Score</h3>
          <span className="text-2xl font-bold text-primary">{safetyReadinessScore}%</span>
        </div>
        <Progress value={safetyReadinessScore} className="h-3 mb-3" />
        
        {/* Safety Readiness Banners */}
        {safetyReadinessScore === 100 && (
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">You are ready to proceed with this purchase</p>
              <p className="text-xs text-green-700 mt-1">All safety checks completed. Remember to trust your instincts.</p>
            </div>
          </div>
        )}
        
        {safetyReadinessScore < 50 && safetyReadinessScore > 0 && (
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900">Complete more safety steps before meeting the seller</p>
              <p className="text-xs text-orange-700 mt-1">{totalCount - checkedCount} items remaining</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Checklist Progress</span>
          <span className="text-muted-foreground">{checkedCount}/{totalCount} completed</span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-4">
        {/* Always check items */}
        <div className="space-y-3">
          {alwaysCheckItems.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <Checkbox
                id={item.id}
                checked={checkedItems.has(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className={`text-sm leading-relaxed cursor-pointer select-none flex-1 ${
                  checkedItems.has(item.id) ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.text}
              </label>
            </div>
          ))}
        </div>

        {/* Conditional items */}
        {conditionalItems.filter(item => item.condition).length > 0 && (
          <div className="space-y-3 pt-3 border-t">
            {conditionalItems.filter(item => item.condition).map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                  item.highlight === "red"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={checkedItems.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-1"
                />
                <label
                  htmlFor={item.id}
                  className={`text-sm leading-relaxed cursor-pointer select-none flex-1 font-medium ${
                    checkedItems.has(item.id)
                      ? "line-through text-muted-foreground"
                      : item.highlight === "red"
                      ? "text-red-900"
                      : "text-orange-900"
                  }`}
                >
                  {item.text}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion message */}
      {checkedCount === totalCount && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-900">
            ✓ You've completed all safety checks! Always trust your instincts and walk away if something feels wrong.
          </p>
        </div>
      )}
    </Card>
  );
}
