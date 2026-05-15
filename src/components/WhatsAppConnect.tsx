import { MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WhatsAppConnectProps {
  whatsappNumber: string | null | undefined;
  phone: string | null | undefined;
  listingTitle: string;
  price: number;
  sellerResponseTime?: "fast" | "moderate" | "slow" | null;
  className?: string;
}

/**
 * WhatsApp Connect Component
 * - Pre-fills message with listing details
 * - Opens WhatsApp app on mobile, WhatsApp Web on desktop
 * - Shows seller response time badge
 */
export function WhatsAppConnect({ 
  whatsappNumber, 
  phone, 
  listingTitle, 
  price,
  sellerResponseTime,
  className = ""
}: WhatsAppConnectProps) {
  const number = whatsappNumber || phone;
  
  if (!number) {
    return null;
  }

  // Format the phone number for WhatsApp (remove non-digits, add country code)
  const formatWhatsAppNumber = (num: string) => {
    let digits = num.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("977")) digits = digits.slice(3);
    digits = digits.replace(/^0+/, "");
    if (digits.length !== 10 || !digits.startsWith("9")) return null;
    return `977${digits}`;
  };

  const formattedNumber = formatWhatsAppNumber(number);
  if (!formattedNumber) return null;

  // Format NPR price
  const formatNPR = (amount: number): string => {
    const s = Math.round(amount).toString();
    if (s.length <= 3) return `NPR ${s}`;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return `NPR ${withCommas},${last3}`;
  };

  const message = `Hi, I saw your ${listingTitle} listed on MyRideNepal for ${formatNPR(price)}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;

  // Response time badge configuration
  const getResponseConfig = (responseTime?: "fast" | "moderate" | "slow" | null) => {
    if (!responseTime) {
      return {
        show: false,
        text: "",
        icon: null,
        className: ""
      };
    }

    switch (responseTime) {
      case "fast":
        return {
          show: true,
          text: "Usually replies within 1 hour",
          icon: CheckCircle2,
          className: "bg-green-50 text-green-700 border-green-200"
        };
      case "moderate":
        return {
          show: true,
          text: "Usually replies within a few hours",
          icon: Clock,
          className: "bg-blue-50 text-blue-700 border-blue-200"
        };
      case "slow":
        return {
          show: true,
          text: "May take a day to reply",
          icon: Clock,
          className: "bg-gray-50 text-gray-700 border-gray-200"
        };
      default:
        return {
          show: false,
          text: "",
          icon: null,
          className: ""
        };
    }
  };

  const responseConfig = getResponseConfig(sellerResponseTime);
  const ResponseIcon = responseConfig.icon;

  return (
    <Card className={`p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* WhatsApp icon */}
        <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-[#25D366]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">WhatsApp Connect</p>
          <p className="text-xs text-muted-foreground">Opens WhatsApp with message ready</p>
        </div>
      </div>

      {/* Response time badge */}
      {responseConfig.show && ResponseIcon && (
        <Badge 
          variant="outline" 
          className={`w-full justify-start gap-2 py-2 px-3 mb-4 font-normal ${responseConfig.className}`}
        >
          <ResponseIcon className="w-3.5 h-3.5" />
          <span className="text-xs">{responseConfig.text}</span>
        </Badge>
      )}

      {/* Preview message */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
        <p className="text-xs text-muted-foreground mb-1">Your message:</p>
        <p className="text-sm text-gray-700 leading-relaxed">
          "{message}"
        </p>
      </div>

      {/* WhatsApp button */}
      <Button 
        asChild 
        size="lg" 
        className="w-full gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg"
      >
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp Seller
        </a>
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-3">
        Opens on mobile app or WhatsApp Web
      </p>
    </Card>
  );
}
