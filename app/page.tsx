"use client";

import { useState, useCallback } from "react";
import { Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/score-gauge";
import { AgentPill, type AgentStatus } from "@/components/agent-pill";
import { IssueCard, type AgentType } from "@/components/issue-card";
import type { Issue, ScanResult } from "@/types";

type TabFilter = "all" | AgentType;

interface AgentState {
  name: string;
  icon: "code" | "secrets" | "config" | "performance";
  status: AgentStatus;
  issueCount: number;
}

const initialAgents: AgentState[] = [
  { name: "Code Scanner", icon: "code", status: "idle", issueCount: 0 },
  { name: "Secret Detector", icon: "secrets", status: "idle", issueCount: 0 },
  { name: "Config Audit", icon: "config", status: "idle", issueCount: 0 },
  { name: "Performance", icon: "performance", status: "idle", issueCount: 0 },
];

const tabs: { label: string; value: TabFilter }[] = [
  { label: "All", value: "all" },
  { label: "Code", value: "code" },
  { label: "Secrets", value: "secrets" },
  { label: "Config", value: "config" },
  { label: "Performance", value: "performance" },
];

export default function SecurityDashboard() {
  const [repoInput, setRepoInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>(initialAgents);
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    if (!repoInput.trim()) {
      setError("Please enter a repository in the format owner/repo");
      return;
    }

    setIsScanning(true);
    setHasScanned(false);
    setScore(0);
    setIssues([]);
    setError(null);
    setAgents(initialAgents);

    // Animate agents sequentially while waiting for API
    const agentOrder: ("code" | "secrets" | "config" | "performance")[] = [
      "code",
      "secrets",
      "config",
      "performance",
    ];

    // Start the animation sequence
    const animationPromise = (async () => {
      for (let i = 0; i < agentOrder.length; i++) {
        const currentAgent = agentOrder[i];

        setAgents((prev) =>
          prev.map((agent) =>
            agent.icon === currentAgent
              ? { ...agent, status: "scanning" as AgentStatus }
              : agent
          )
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 1200 + Math.random() * 600)
        );

        // Don't complete until API is done - just keep scanning state
      }
    })();

    // Make the actual API call
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Scan failed");
      }

      const result: ScanResult = data;

      // Wait for animation to complete before showing results
      await animationPromise;

      // Update agents with actual results
      setAgents([
        {
          name: "Code Scanner",
          icon: "code",
          status: "complete",
          issueCount: result.issues.filter((i) => i.agent === "code").length,
        },
        {
          name: "Secret Detector",
          icon: "secrets",
          status: "complete",
          issueCount: result.issues.filter((i) => i.agent === "secrets").length,
        },
        {
          name: "Config Audit",
          icon: "config",
          status: "complete",
          issueCount: result.issues.filter((i) => i.agent === "config").length,
        },
        {
          name: "Performance",
          icon: "performance",
          status: "complete",
          issueCount: result.issues.filter((i) => i.agent === "performance")
            .length,
        },
      ]);

      setIssues(result.issues);
      setScore(result.score);
      setHasScanned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setAgents(initialAgents);
    } finally {
      setIsScanning(false);
    }
  }, [repoInput]);

  const filteredIssues =
    activeTab === "all"
      ? issues
      : issues.filter((issue) => issue.agent === activeTab);

  const getIssueStats = () => {
    const critical = issues.filter((i) => i.severity === "CRITICAL").length;
    const warning = issues.filter((i) => i.severity === "WARNING").length;
    const info = issues.filter((i) => i.severity === "INFO").length;
    return { critical, warning, info };
  };

  const stats = getIssueStats();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Vercel Defender
            </span>
          </div>

          <div className="flex-1 max-w-md ml-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="owner/repo"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isScanning && runScan()}
                className="font-mono text-sm bg-secondary border-border placeholder:text-muted-foreground"
              />
              <Button
                onClick={runScan}
                disabled={isScanning}
                className="px-6 bg-white text-[#0a0a0a] hover:bg-white/90 font-medium"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                    Scanning
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Scan
                  </span>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
            {/* Score Gauge */}
            <ScoreGauge score={hasScanned ? score : 0} isScanning={isScanning} />

            {/* Agent Pills */}
            <div className="grid grid-cols-2 gap-3">
              {agents.map((agent) => (
                <AgentPill
                  key={agent.icon}
                  name={agent.name}
                  icon={agent.icon}
                  status={agent.status}
                  issueCount={agent.issueCount}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          {hasScanned && (
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-muted-foreground">
                  {stats.critical} Critical
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  {stats.warning} Warning
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">
                  {stats.info} Info
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Issues Section */}
      {hasScanned && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const count =
                  tab.value === "all"
                    ? issues.length
                    : issues.filter((i) => i.agent === tab.value).length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.value
                        ? "bg-white text-[#0a0a0a]"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                        activeTab === tab.value
                          ? "bg-[#0a0a0a]/10"
                          : "bg-muted-foreground/20"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No issues found in this category.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasScanned && !isScanning && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-secondary flex items-center justify-center">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No repository scanned</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a repository in the format{" "}
              <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded">
                owner/repo
              </code>{" "}
              and click Scan to analyze your codebase for security
              vulnerabilities.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
