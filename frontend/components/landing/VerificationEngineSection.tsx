"use client";

import { useState } from "react";
import { Terminal, CheckCircle2, Copy, Check } from "lucide-react";

interface TerminalTab {
  id: string;
  label: string;
  command: string;
  output: string[];
  assertions: string;
}

const TABS: TerminalTab[] = [
  {
    id: "golang",
    label: "Go Chi & pgx",
    command: "go test -v -race ./internal/streak/...",
    output: [
      "=== RUN   TestStreakCalculation_DaylightSavingsEdgeCase",
      "--- PASS: TestStreakCalculation_DaylightSavingsEdgeCase (0.01s)",
      "=== RUN   TestStreakCalculation_RaceUnderConcurrentCheckins",
      "--- PASS: TestStreakCalculation_RaceUnderConcurrentCheckins (0.03s)",
      "=== RUN   TestPgxConnectionPool_MaxIdleExhaustion",
      "--- PASS: TestPgxConnectionPool_MaxIdleExhaustion (0.02s)",
      "PASS",
      "ok  github.com/buildscape/habitly/internal/streak  0.064s",
    ],
    assertions: "3/3 Assertions Verified · 0 Data Races Detected",
  },
  {
    id: "python",
    label: "Python FastAPI",
    command: "pytest -v tests/test_rate_limiter.py tests/test_sm2.py",
    output: [
      "tests/test_rate_limiter.py::test_sliding_window_burst PASSED  [ 33%]",
      "tests/test_rate_limiter.py::test_redis_failover_in_memory PASSED [ 66%]",
      "tests/test_sm2.py::test_supermemo_interval_calculation PASSED [100%]",
      "",
      "======================== 3 passed in 0.42s ========================",
    ],
    assertions: "All Endpoints Passed · Redis Rate Limiting Active",
  },
  {
    id: "rust",
    label: "Rust Tokio",
    command: "cargo test -- --nocapture test_raft_election",
    output: [
      "running 1 test",
      "test raft::tests::test_raft_election_split_vote ... ok",
      "",
      "test result: ok. 1 passed; 0 failed; 0 ignored; finished in 0.08s",
    ],
    assertions: "Raft Consensus Quorum Reached · Zero Leaks",
  },
];

export function VerificationEngineSection() {
  const [activeTab, setActiveTab] = useState<string>("golang");
  const [copied, setCopied] = useState(false);

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-20 sm:py-24 border-b border-white/[0.06] relative">
      {/* Background Accent Atmospheric Glow */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side: Editorial & Explanatory (5 cols) */}
        <div className="lg:col-span-5">
          <div className="mb-2.5 inline-flex">
            <span className="pill-mono">
              <Terminal className="h-3 w-3 text-white" />
              <span>DETERMINISTIC VERIFICATION</span>
            </span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Verify code with deterministic assertions, not wishful thinking.
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 mb-6">
            In tutorial hell, you guess whether your code works until production blows up. On BuildScape, every single phase provides automated terminal assertions that stress test edge cases, race conditions, and API contracts.
          </p>

          <div className="space-y-3.5 border-t border-white/[0.06] pt-6 font-mono text-xs">
            <div className="flex items-start gap-2.5 text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Automated test suites with daylight savings, race conditions, and error recovery</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Pinned library dependencies that eliminate version drift</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Fingerprinted Git tree verification to earn shareable Proof of Work</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Modern Terminal Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-white/10 bg-[#07070A] shadow-2xl overflow-hidden">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0A0A0E] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="font-mono text-xs text-neutral-400 ml-2">checkpoints@buildscape:~</span>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-1">
                {TABS.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white/10 text-white font-semibold"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs leading-relaxed text-neutral-300">
              {/* Command execution prompt */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span className="text-neutral-200">{currentTab.command}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Terminal stdout output */}
              <div className="space-y-1 text-neutral-400">
                {currentTab.output.map((line, idx) => {
                  const isPass = line.includes("PASS") || line.includes("PASSED") || line.includes("ok");
                  return (
                    <div
                      key={idx}
                      className={isPass ? "text-emerald-400 font-semibold" : "text-neutral-400"}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

              {/* Status footer pill */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-neutral-500">CHECKPOINT ASSERTION:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentTab.assertions}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

