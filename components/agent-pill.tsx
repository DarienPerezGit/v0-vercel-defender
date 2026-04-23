"use client";

import { Check, Code, KeyRound, Settings, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AgentStatus = "idle" | "scanning" | "complete";

interface AgentPillProps {
  name: string;
  icon: "code" | "secret" | "config" | "performance";
  status: AgentStatus;
  issueCount: number;
}

const iconMap = {
  code: Code,
  secret: KeyRound,
  config: Settings,
  performance: Zap,
};

export function AgentPill({ name, icon, status, issueCount }: AgentPillProps) {
  const Icon = iconMap[icon];
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-secondary/50 min-w-[180px] transition-all duration-300",
        status === "scanning" && "border-white/30 bg-secondary",
        status === "complete" && issueCount > 0 && "border-yellow-500/30",
        status === "complete" && issueCount === 0 && "border-green-500/30"
      )}
    >
      <Icon className="w-5 h-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="text-sm font-medium">{name}</p>
      </div>
      <div className="w-6 h-6 flex items-center justify-center">
        {status === "idle" && (
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        )}
        {status === "scanning" && (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        )}
        {status === "complete" && issueCount === 0 && (
          <Check className="w-5 h-5 text-green-500" />
        )}
        {status === "complete" && issueCount > 0 && (
          <span className="text-sm font-mono font-bold text-yellow-500">{issueCount}</span>
        )}
      </div>
    </div>
  );
}
