var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/storage.ts
var storage_exports = {};
__export(storage_exports, {
  initialStorage: () => initialStorage,
  loadStorage: () => loadStorage,
  makeHistoryEntry: () => makeHistoryEntry,
  newSession: () => newSession,
  resolveRemaining: () => resolveRemaining,
  saveStorage: () => saveStorage
});
module.exports = __toCommonJS(storage_exports);

// src/data/protocol.ts
var protocol = [
  {
    id: "activation",
    title: "Mental activation",
    minutes: 90,
    blocks: [
      { id: "cognitive-re-entry", title: "Cognitive re-entry", minutes: 15, instructions: ["Name the topic and set aside distractions.", "Write three things you remember without looking.", "Identify the first question you want to answer."] },
      { id: "mathematical-activation", title: "Mathematical activation", minutes: 20, instructions: ["Work through key algebra or calculus tools.", "Derive one familiar result from memory.", "Note any symbols or operations that feel rusty."] },
      { id: "math-to-physics-bridge", title: "Math-to-physics bridge", minutes: 25, important: true, instructions: ["Connect each equation to a physical claim.", "Check dimensions before moving on.", "Describe what changes when a variable increases."] },
      { id: "physical-visualization", title: "Physical visualization", minutes: 20, instructions: ["Draw the system, axes, and constraints.", "Imagine limiting cases and boundary conditions.", "State what a measurement would look like."] },
      { id: "investigation-briefing", title: "Investigation briefing", minutes: 10, instructions: ["Write a precise investigation question.", "List the evidence or derivation you need.", "Choose a first small, testable step."] }
    ]
  },
  {
    id: "investigation",
    title: "Deep physics investigation",
    minutes: 120,
    blocks: [
      { id: "conceptual-investigation", title: "Conceptual investigation", minutes: 25, instructions: ["Read with a question in mind.", "Separate assumptions from conclusions.", "Write the core principle in your own words."] },
      { id: "mathematical-derivation", title: "Mathematical derivation", minutes: 30, instructions: ["Derive step by step without skipping units.", "Mark the first uncertain transition.", "Check the result against a known limit."] },
      { id: "physical-interpretation", title: "Physical interpretation", minutes: 15, instructions: ["Translate the result into a prediction.", "Identify what the signs and scales mean.", "Sketch the behaviour of the system."] },
      { id: "independent-problem-solving", title: "Independent problem-solving", minutes: 40, instructions: ["Solve before checking a reference.", "State your strategy before calculating.", "Review errors as evidence, not verdicts."] },
      { id: "researchers-log", title: "Researcher's log", minutes: 10, instructions: ["Record the result and open questions.", "Capture one useful equation or diagram.", "Choose the next investigation starting point."] }
    ]
  }
];
var allBlocks = protocol.flatMap((stage) => stage.blocks.map((block) => ({ ...block, stageId: stage.id })));

// src/storage.ts
var storageKey = "pap-v2-data";
var blankAnswers = () => ({ variables: "", units: "", relationships: "", geometry: "", meaning: "" });
var newSession = () => ({
  id: crypto.randomUUID(),
  topic: "",
  recall: ["", "", ""],
  stageId: "activation",
  activeBlockId: allBlocks[0].id,
  completedBlockIds: [],
  remainingSeconds: allBlocks[0].minutes * 60,
  running: false,
  endsAt: null,
  equationAnswers: blankAnswers(),
  startedAt: Date.now()
});
var initialStorage = () => ({ activeSession: newSession(), history: [], theme: "dark" });
function loadStorage() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialStorage();
    const parsed = JSON.parse(saved);
    const rawHistory = Array.isArray(parsed.history) ? parsed.history : [];
    let migrated = false;
    const history = rawHistory.map((entry) => {
      const savedAt = Number.isInteger(entry.savedAt) ? entry.savedAt : Date.now();
      const id = typeof entry.id === "string" && entry.id ? entry.id : crypto.randomUUID();
      if (savedAt !== entry.savedAt || id !== entry.id) migrated = true;
      return { ...entry, id, savedAt };
    });
    const data = {
      activeSession: { ...newSession(), ...parsed.activeSession, equationAnswers: { ...blankAnswers(), ...parsed.activeSession?.equationAnswers } },
      history,
      theme: parsed.theme ?? "dark"
    };
    if (migrated) saveStorage(data);
    return data;
  } catch {
    return initialStorage();
  }
}
function saveStorage(data) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
  }
}
var resolveRemaining = (session, now = Date.now()) => session.running && session.endsAt ? Math.max(0, Math.ceil((session.endsAt - now) / 1e3)) : session.remainingSeconds;
var makeHistoryEntry = (session, focusMinutes) => ({
  id: crypto.randomUUID(),
  savedAt: Date.now(),
  date: (/* @__PURE__ */ new Date()).toISOString(),
  topic: session.topic.trim() || "Untitled study session",
  completedBlocks: session.completedBlockIds.length,
  focusMinutes
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  initialStorage,
  loadStorage,
  makeHistoryEntry,
  newSession,
  resolveRemaining,
  saveStorage
});
