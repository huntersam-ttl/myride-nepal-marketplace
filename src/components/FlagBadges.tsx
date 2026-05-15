import { ShieldCheck, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Flag } from "@/lib/flag-detector";

interface FlagBadgesProps {
  flags: Flag[];
}

export function FlagBadges({ flags }: FlagBadgesProps) {
  // No issues detected
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <ShieldCheck className="w-4 h-4" />
        <span>No issues detected</span>
      </div>
    );
  }

  // Show flags
  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag, index) => {
        const config = getFlagConfig(flag.level);
        return (
          <div
            key={index}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
          >
            <span className={config.emojiClassName}>{config.emoji}</span>
            <span>{flag.message}</span>
          </div>
        );
      })}
    </div>
  );
}

function getFlagConfig(level: Flag["level"]) {
  switch (level) {
    case "critical":
      return {
        emoji: "🔴",
        className: "bg-red-100 text-red-700 border border-red-200",
        emojiClassName: "text-red-600",
      };
    case "warning":
      return {
        emoji: "⚠️",
        className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        emojiClassName: "text-yellow-600",
      };
    case "info":
      return {
        emoji: "ℹ️",
        className: "bg-blue-100 text-blue-700 border border-blue-200",
        emojiClassName: "text-blue-600",
      };
  }
}
