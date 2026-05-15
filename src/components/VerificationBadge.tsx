import { User, BadgeCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type VerificationLevel = "basic" | "verified" | "trusted";

interface VerificationBadgeProps {
  verification_level: VerificationLevel;
}

const verificationConfig = {
  basic: {
    icon: User,
    label: "Basic Seller",
    tooltip: "Phone number confirmed",
    className: "bg-gray-50 text-gray-700 border border-gray-200",
  },
  verified: {
    icon: BadgeCheck,
    label: "Verified Seller",
    tooltip: "Identity document verified by MyRideNepal team",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  trusted: {
    icon: ShieldCheck,
    label: "Trusted Seller",
    tooltip: "Verified seller with multiple successful sales",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

export function VerificationBadge({ verification_level }: VerificationBadgeProps) {
  const config = verificationConfig[verification_level];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={config.className}>
            <Icon className="w-3.5 h-3.5 mr-1" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
