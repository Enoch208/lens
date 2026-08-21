/** Semantic observations Kane read out of the real browser, keyed by store-as name. */
export type Observations = Record<string, string>;

export type KaneStatus = "passed" | "failed" | "error";

export type KaneRun = {
  /** Verdict for the whole *_test.md file, from `test_md_summary.overall_status`. */
  status: KaneStatus;
  /** Merged store-as values from every step: final_state, context.variables, context.memory. */
  observed: Observations;
  /** Absolute path to the Kane run directory holding evidence for this run. */
  runDir: string | null;
  /** Kane dashboard link proving a real browser produced these observations. */
  shareUrl: string | null;
  durationS: number | null;
  /** Float. Absent on a cached replay — null means "unknown", never zero. */
  credits: number | null;
  /** True when Kane replayed a committed recording instead of authoring live. */
  replayed: boolean;
  /** Kane's own words on why the run ended the way it did. */
  reason: string | null;
  /** Heading of the first step that did not pass, for the agent's block message. */
  failedStep: string | null;
  exitCode: number;
  /** Set when LENS could not get a verdict at all (auth, timeout, crash) — never a test failure. */
  infraError: string | null;
};

export type FlowDeltaVerdict = "SAME" | "UNEXPECTED_CHANGE" | "EXPECTED_CHANGE" | "MISSING";

export type FlowDelta = {
  key: string;
  baseline: string | null;
  candidate: string | null;
  verdict: FlowDeltaVerdict;
};

export type BaselineFlow = {
  test: string;
  status: KaneStatus;
  state: Observations;
  runDir: string | null;
  shareUrl: string | null;
  durationS: number | null;
};

export type Baseline = {
  commit: string;
  createdAt: string;
  flows: Record<string, BaselineFlow>;
};

export type FlowConfig = {
  /** Path to the committed *_test.md browser contract for this flow. */
  test: string;
  /** Observables whose value must not move unless the change explicitly authorized it. */
  protect: string[];
  risk: "HIGH" | "MED" | "LOW";
  label: string;
};

export type LensConfig = {
  appUrl: string;
  variablesFile: string;
  perTestTimeoutS: number;
  hookBudgetS: number;
  maxAttempts: number;
  flows: Record<string, FlowConfig>;
};

export type VerifiedFlow = {
  flow: string;
  status: KaneStatus;
  shareUrl: string | null;
  runDir: string | null;
  reason: string | null;
  failedStep: string | null;
  deltas: FlowDelta[];
  infraError: string | null;
};

export type TimelineKind = "change" | "impact" | "verify" | "fail" | "repair" | "proof";

export type TimelineEntry = {
  at: string;
  label: string;
  kind: TimelineKind;
};

export type VerifyReport = {
  startedAt: string;
  finishedAt: string;
  /** `passed` ship it · `blocked` an unrelated behavior moved · `error` LENS could not tell. */
  verdict: "passed" | "blocked" | "error";
  changeRequest: string;
  agent: string;
  attempt: number;
  maxAttempts: number;
  changedFiles: string[];
  affectedFlows: string[];
  /** Changed files no glob claimed. Logged loudly — never silently skipped. */
  unmappedFiles: string[];
  skippedFlows: string[];
  flows: VerifiedFlow[];
  unexpectedCount: number;
  timeline: TimelineEntry[];
};
