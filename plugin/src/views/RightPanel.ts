import type BibleSemanticPlugin from "../main";
import type { RightModule, CoPartnerSession } from "../types";
import { exportDatasetToCSVs } from "../services/ExcelInterop";

const RIGHT_MODULE_LABELS: Record<RightModule, string> = {
  chat: "Chat",
  writing_pad: "Writing Pad",
  notes: "Notes",
  export: "Export",
};

export function renderRightPanel(
  container: HTMLElement,
  plugin: BibleSemanticPlugin,
  activeModule: RightModule,
  selectedVerseUuid: string | null,
  onModuleChange: (mod: RightModule) => void
): void {
  container.empty();

  // Module tabs
  const tabs = container.createDiv({ cls: "bsw-panel-tabs" });
  for (const mod of plugin.settings.rightModuleOrder) {
    if (!plugin.settings.rightModuleVisibility[mod]) continue;
    const tab = tabs.createEl("button", {
      text: RIGHT_MODULE_LABELS[mod],
      cls: `bsw-panel-tab ${activeModule === mod ? "bsw-panel-tab-active" : ""}`,
    });
    tab.addEventListener("click", () => onModuleChange(mod));
  }

  const content = container.createDiv({ cls: "bsw-panel-content" });

  switch (activeModule) {
    case "chat":
      renderChat(content);
      break;
    case "writing_pad":
      renderWritingPad(content, plugin, selectedVerseUuid);
      break;
    case "notes":
      renderNotes(content, plugin, selectedVerseUuid);
      break;
    case "export":
      renderExport(content, plugin);
      break;
  }
}

function renderChat(container: HTMLElement): void {
  container.createEl("h4", { text: "Chat (Placeholder)" });
  container.createEl("p", {
    text: "Chat integration will connect to an AI assistant for contextual Bible research. This is a placeholder for the MVP.",
    cls: "bsw-panel-hint",
  });
  const chatArea = container.createDiv({ cls: "bsw-chat-area" });
  chatArea.createDiv({ cls: "bsw-chat-messages" });
  const inputRow = chatArea.createDiv({ cls: "bsw-chat-input-row" });
  const input = inputRow.createEl("input", {
    type: "text",
    placeholder: "Ask a question about this passage...",
    cls: "bsw-chat-input",
  });
  input.disabled = true;
  const sendBtn = inputRow.createEl("button", { text: "Send", cls: "bsw-chat-send" });
  sendBtn.disabled = true;
}

function renderWritingPad(container: HTMLElement, plugin: BibleSemanticPlugin, selectedVerseUuid: string | null): void {
  container.createEl("h4", { text: "Writing Pad" });

  const segment = selectedVerseUuid ? plugin.store.getSegment(selectedVerseUuid) : null;
  if (segment) {
    container.createEl("p", { text: `Context: ${segment.content.slice(0, 80)}...`, cls: "bsw-writing-context" });
  }

  const textarea = container.createEl("textarea", {
    cls: "bsw-writing-textarea",
    attr: { placeholder: "Write your notes, commentary, or analysis here...", rows: "12" },
  });

  const btnRow = container.createDiv({ cls: "bsw-writing-btn-row" });

  // Research co-partner button
  const coPartnerBtn = btnRow.createEl("button", { text: "Start Research Session", cls: "bsw-btn bsw-btn-primary" });
  coPartnerBtn.addEventListener("click", () => {
    renderCoPartnerFlow(container, plugin);
  });
}

function renderCoPartnerFlow(container: HTMLElement, plugin: BibleSemanticPlugin): void {
  container.empty();
  container.createEl("h4", { text: "Research Co-Partner Session" });
  container.createEl("p", { text: "Track your belief/research question with structured analysis.", cls: "bsw-panel-hint" });

  const form = container.createDiv({ cls: "bsw-copartner-form" });

  form.createEl("label", { text: "Belief or Research Question:" });
  const beliefInput = form.createEl("textarea", {
    cls: "bsw-input",
    attr: { placeholder: "State your belief or question...", rows: "3" },
  });

  form.createEl("label", { text: "Your Current Lean:" });
  const leanInput = form.createEl("input", {
    type: "text",
    cls: "bsw-input",
    attr: { placeholder: "e.g., 'Literal 6-day creation'" },
  });

  form.createEl("label", { text: "Confidence Before (0-100):" });
  const confInput = form.createEl("input", {
    type: "number",
    cls: "bsw-input",
    attr: { min: "0", max: "100", value: "50" },
  });

  const startBtn = form.createEl("button", { text: "Begin Session", cls: "bsw-btn bsw-btn-primary" });
  startBtn.addEventListener("click", () => {
    const session = plugin.sessionManager.createSession(
      (beliefInput as HTMLTextAreaElement).value,
      (leanInput as HTMLInputElement).value || null,
      parseInt((confInput as HTMLInputElement).value, 10) || 50
    );
    renderActiveSession(container, plugin, session.session_id);
  });
}

function renderActiveSession(container: HTMLElement, plugin: BibleSemanticPlugin, sessionId: string): void {
  const session = plugin.sessionManager.getSession(sessionId);
  if (!session) return;

  container.empty();
  container.createEl("h4", { text: "Active Research Session" });
  container.createEl("p", { text: `Question: "${session.belief_statement}"` });
  container.createEl("p", { text: `Lean: ${session.user_lean_before ?? "None"} | Confidence: ${session.confidence_before}%` });

  // Add hypothesis
  const hypSection = container.createDiv({ cls: "bsw-session-section" });
  hypSection.createEl("h5", { text: "Add Hypothesis" });
  const hypLabel = hypSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Hypothesis label" } });
  const hypFor = hypSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Best arguments FOR (comma-separated)" } });
  const hypAgainst = hypSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Best arguments AGAINST (comma-separated)" } });
  const addHypBtn = hypSection.createEl("button", { text: "Add Hypothesis", cls: "bsw-btn" });
  addHypBtn.addEventListener("click", () => {
    plugin.sessionManager.addHypothesis(
      sessionId,
      (hypLabel as HTMLInputElement).value,
      (hypFor as HTMLInputElement).value.split(",").map((s) => s.trim()),
      (hypAgainst as HTMLInputElement).value.split(",").map((s) => s.trim())
    );
    renderActiveSession(container, plugin, sessionId);
  });

  // Show hypotheses
  if (session.hypotheses.length > 0) {
    const hypList = container.createDiv({ cls: "bsw-session-section" });
    hypList.createEl("h5", { text: `Hypotheses (${session.hypotheses.length})` });
    for (const h of session.hypotheses) {
      const div = hypList.createDiv({ cls: "bsw-hypothesis-item" });
      div.createEl("strong", { text: h.label });
      div.createEl("p", { text: `FOR: ${h.best_for.join(", ")}` });
      div.createEl("p", { text: `AGAINST: ${h.best_against.join(", ")}` });
    }
  }

  // Add evidence
  const evSection = container.createDiv({ cls: "bsw-session-section" });
  evSection.createEl("h5", { text: "Add Evidence" });
  const evSource = evSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Source" } });
  const evClaim = evSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Claim" } });
  const evDir = evSection.createEl("select", { cls: "bsw-input" });
  evDir.createEl("option", { text: "Supports", value: "supports" });
  evDir.createEl("option", { text: "Opposes", value: "opposes" });
  evDir.createEl("option", { text: "Mixed", value: "mixed" });
  const evStr = evSection.createEl("input", { type: "number", cls: "bsw-input", attr: { min: "0", max: "1", step: "0.1", value: "0.5", placeholder: "Strength 0-1" } });
  const addEvBtn = evSection.createEl("button", { text: "Add Evidence", cls: "bsw-btn" });
  addEvBtn.addEventListener("click", () => {
    plugin.sessionManager.addEvidence(
      sessionId,
      (evSource as HTMLInputElement).value,
      (evClaim as HTMLInputElement).value,
      (evDir as HTMLSelectElement).value as "supports" | "opposes" | "mixed",
      parseFloat((evStr as HTMLInputElement).value) || 0.5
    );
    renderActiveSession(container, plugin, sessionId);
  });

  // Finalize
  const finSection = container.createDiv({ cls: "bsw-session-section" });
  finSection.createEl("h5", { text: "Finalize Session" });
  const finConclusion = finSection.createEl("textarea", { cls: "bsw-input", attr: { placeholder: "Provisional conclusion", rows: "2" } });
  const finLean = finSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Lean after analysis" } });
  const finConf = finSection.createEl("input", { type: "number", cls: "bsw-input", attr: { min: "0", max: "100", value: String(session.confidence_before) } });
  const finFlip = finSection.createEl("input", { type: "text", cls: "bsw-input", attr: { placeholder: "Flip conditions (comma-separated)" } });
  const finalizeBtn = finSection.createEl("button", { text: "Finalize & Export", cls: "bsw-btn bsw-btn-primary" });
  finalizeBtn.addEventListener("click", () => {
    plugin.sessionManager.finalizeSession(
      sessionId,
      (finConclusion as HTMLTextAreaElement).value,
      (finLean as HTMLInputElement).value || null,
      parseInt((finConf as HTMLInputElement).value, 10) || 50,
      (finFlip as HTMLInputElement).value.split(",").map((s) => s.trim()),
      []
    );

    // Run hidden analysis routine
    const analysis = plugin.sessionManager.analyzeSession(sessionId);
    const json = plugin.sessionManager.exportSessionJSON(sessionId);

    container.empty();
    container.createEl("h4", { text: "Session Complete" });
    if (analysis) {
      container.createEl("h5", { text: "Analysis" });
      container.createEl("pre", { text: analysis.steelmanNote, cls: "bsw-analysis-block" });
      container.createEl("pre", { text: analysis.strongestObjection, cls: "bsw-analysis-block" });
      container.createEl("pre", { text: analysis.factsVsInterpretation, cls: "bsw-analysis-block" });
    }
    if (json) {
      container.createEl("h5", { text: "Session JSON" });
      const pre = container.createEl("pre", { text: json, cls: "bsw-json-output" });
      const copyBtn = container.createEl("button", { text: "Copy JSON", cls: "bsw-btn" });
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(json);
      });
    }
  });
}

function renderNotes(container: HTMLElement, plugin: BibleSemanticPlugin, selectedVerseUuid: string | null): void {
  container.createEl("h4", { text: "Notes" });

  const segment = selectedVerseUuid ? plugin.store.getSegment(selectedVerseUuid) : null;
  const annotations = selectedVerseUuid ? plugin.store.getAnnotations(selectedVerseUuid) : [];

  if (segment) {
    container.createEl("p", { text: `Verse: ${segment.segment_uuid}`, cls: "bsw-notes-context" });
  }

  // Show existing annotation notes
  const notedAnns = annotations.filter((a) => a.note);
  if (notedAnns.length > 0) {
    container.createEl("h5", { text: "Existing Notes" });
    for (const a of notedAnns) {
      const div = container.createDiv({ cls: "bsw-note-item" });
      div.createEl("strong", { text: a.entity.join(", ") });
      div.createEl("p", { text: a.note ?? "" });
    }
  }

  // User notes textarea
  container.createEl("h5", { text: "Your Notes" });
  container.createEl("textarea", {
    cls: "bsw-notes-textarea",
    attr: { placeholder: "Add your personal notes...", rows: "8" },
  });
}

function renderExport(container: HTMLElement, plugin: BibleSemanticPlugin): void {
  container.createEl("h4", { text: "Export" });

  // Export dataset as JSON
  const jsonBtn = container.createEl("button", { text: "Export Dataset (JSON)", cls: "bsw-btn bsw-btn-primary" });
  jsonBtn.addEventListener("click", () => {
    const datasetIds = plugin.store.getDatasetIds();
    for (const id of datasetIds) {
      const ds = plugin.store.getDataset(id);
      if (ds) {
        const json = JSON.stringify(ds, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  });

  // Export as CSV
  const csvBtn = container.createEl("button", { text: "Export Dataset (CSV)", cls: "bsw-btn" });
  csvBtn.addEventListener("click", () => {
    const datasetIds = plugin.store.getDatasetIds();
    for (const id of datasetIds) {
      const ds = plugin.store.getDataset(id);
      if (ds) {
        const csvs = exportDatasetToCSVs(ds);
        for (const [filename, csvContent] of Object.entries(csvs)) {
          const blob = new Blob([csvContent], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${id}-${filename}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    }
  });

  // Export sessions
  const sessBtn = container.createEl("button", { text: "Export All Sessions (JSON)", cls: "bsw-btn" });
  sessBtn.addEventListener("click", () => {
    const sessions = plugin.sessionManager.getAllSessions();
    if (sessions.length === 0) {
      container.createEl("p", { text: "No research sessions to export.", cls: "bsw-panel-hint" });
      return;
    }
    const json = JSON.stringify(sessions, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-sessions.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  container.createEl("h5", { text: "Excel Interop Note" });
  container.createEl("p", {
    text: "CSV exports are compatible with Excel/Google Sheets. For full .xlsx support, integrate SheetJS (xlsx) library. Import stubs accept CSV format with matching headers.",
    cls: "bsw-panel-hint",
  });
}
