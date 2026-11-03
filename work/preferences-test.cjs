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

// src/backup.ts
var backup_exports = {};
__export(backup_exports, {
  createBackup: () => createBackup,
  isActiveSession: () => isActiveSession,
  isPreferences: () => isPreferences,
  lastExportKey: () => lastExportKey,
  mergeHistory: () => mergeHistory,
  validateBackup: () => validateBackup
});
module.exports = __toCommonJS(backup_exports);
var lastExportKey = "pap_last_export";
function createBackup(history, state, preferences) {
  return { app: "pap", version: 1, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), history: history.map((entry) => ({ id: entry.id, savedAt: entry.savedAt, date: entry.date, topic: entry.topic, blocks: entry.completedBlocks, focus: entry.focusMinutes ?? 1, energy: entry.energy })), state, preferences };
}
function validateBackup(value) {
  if (!value || typeof value !== "object") return { error: "This file is not a PAP backup." };
  const raw = value;
  if (raw.app !== "pap" || raw.version !== 1 || !Array.isArray(raw.history)) return { error: "This file is not a valid PAP v1 backup." };
  let invalid = 0;
  const history = [];
  for (const entry of raw.history) {
    if (!entry || typeof entry !== "object") {
      invalid++;
      continue;
    }
    const item = entry;
    const blocks = item.blocks;
    const focus = item.focus;
    const savedAt = item.savedAt;
    if (typeof item.id !== "string" || !item.id || typeof item.date !== "string" || typeof blocks !== "number" || !Number.isInteger(blocks) || blocks < 0 || blocks > 10 || typeof focus !== "number" || !Number.isInteger(focus) || focus < 1 || focus > 240) {
      invalid++;
      continue;
    }
    const energy = typeof item.energy === "number" && Number.isInteger(item.energy) && item.energy >= 0 && item.energy <= 5 ? item.energy : 0;
    history.push({ id: item.id, date: item.date, topic: typeof item.topic === "string" ? item.topic : "Untitled study session", blocks, focus, energy, savedAt: typeof savedAt === "number" && Number.isInteger(savedAt) ? savedAt : Date.parse(item.date) || Date.now() });
  }
  if (raw.history.length > 0 && history.length === 0) return { error: "This backup has no valid session entries." };
  return { backup: { app: "pap", version: 1, exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : (/* @__PURE__ */ new Date()).toISOString(), history, state: raw.state, preferences: raw.preferences }, invalid };
}
function mergeHistory(local, imported) {
  const existing = new Set(local.map((entry) => entry.id));
  let duplicates = 0;
  const additions = [];
  for (const entry of imported) {
    if (existing.has(entry.id)) {
      duplicates++;
      continue;
    }
    existing.add(entry.id);
    additions.push({ id: entry.id, savedAt: entry.savedAt, date: entry.date, topic: entry.topic, completedBlocks: entry.blocks, focusMinutes: entry.focus, energy: entry.energy });
  }
  return { history: [...local, ...additions].sort((a, b) => a.savedAt - b.savedAt), imported: additions.length, duplicates };
}
function isActiveSession(value) {
  if (!value || typeof value !== "object") return false;
  const state = value;
  return typeof state.id === "string" && typeof state.topic === "string" && Array.isArray(state.recall) && typeof state.activeBlockId === "string" && Array.isArray(state.completedBlockIds) && typeof state.remainingSeconds === "number" && typeof state.running === "boolean" && typeof state.startedAt === "number";
}
function isPreferences(value) {
  if (!value || typeof value !== "object") return false;
  const preferences = value;
  const restMinutes = preferences.restMinutes;
  return typeof preferences.soundOn === "boolean" && typeof restMinutes === "number" && Number.isInteger(restMinutes) && [10, 15, 20, 25, 30].includes(restMinutes) && (preferences.theme === "dark" || preferences.theme === "light");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBackup,
  isActiveSession,
  isPreferences,
  lastExportKey,
  mergeHistory,
  validateBackup
});
