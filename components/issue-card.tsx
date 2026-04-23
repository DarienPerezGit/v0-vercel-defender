"use client";

import { useState } from "react";
import { ChevronDown, Code, KeyRound, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type Severity = "CRITICAL" | "WARNING" | "INFO";
export type AgentType = "code" | "secret" | "config" | "performance";

export interface Issue {
  id: string;
  severity: Severity;
  agent: AgentType;
  title: string;
  filePath: string;
  lineNumber: number;
  codeSnippet: string;
  fixSuggestion: string;
}

interface IssueCardProps {
  issue: Issue;
}

const severityStyles: Record<Severity, string> = {
  CRITICAL: "bg-red-500/10 text-red-500 border-red-500/30",
  WARNING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  INFO: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

const agentIcons: Record<AgentType, typeof Code> = {
  code: Code,
  secret: KeyRound,
  config: Settings,
  performance: Zap,
};

const agentLabels: Record<AgentType, string> = {
  code: "Code Scanner",
  secret: "Secret Detector",
  config: "Config Audit",
  performance: "Performance",
};

export function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const AgentIcon = agentIcons[issue.agent];
  
  return (
    <div 
      className="border border-border rounded-lg bg-secondary/30 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-4 flex items-start gap-4 text-left hover:bg-secondary/50 transition-colors"
      >
        {/* Severity badge */}
        <span 
          className={cn(
            "px-2 py-1 text-xs font-mono font-bold rounded border shrink-0",
            severityStyles[issue.severity]
          )}
        >
          {issue.severity}
        </span>
        
        {/* Agent icon */}
        <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center shrink-0" title={agentLabels[issue.agent]}>
          <AgentIcon className="w-4 h-4 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{issue.title}</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {issue.filePath}:{issue.lineNumber}
          </p>
        </div>
        
        {/* Expand icon */}
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform shrink-0",
            isExpanded && "transform rotate-180"
          )}
        />
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Offending Code</p>
            <pre className="bg-[#0a0a0a] border border-border rounded-md p-4 overflow-x-auto">
              <code className="text-sm font-mono text-red-400">{issue.codeSnippet}</code>
            </pre>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Suggested Fix</p>
            <div className="bg-green-500/5 border border-green-500/20 rounded-md p-4">
              <p className="text-sm text-green-400">{issue.fixSuggestion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
