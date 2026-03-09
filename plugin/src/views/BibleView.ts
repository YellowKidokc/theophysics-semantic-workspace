import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type BibleSemanticPlugin from "../main";
import type {
  ReaderMode,
  ActivePanel,
  Segment,
  Annotation,
  SegmentLink,
  LeftModule,
  RightModule,
  BibleWorkspaceSettings,
} from "../types";
import { ENTITY_COLORS, ROLE_ICONS, EVIDENCE_BORDERS } from "../types";
import { getParagraphs, getVerses, getVerseNumber } from "../data/loader";
import { renderLeftPanel } from "./LeftPanel";
import { renderRightPanel } from "./RightPanel";

export const BIBLE_VIEW_TYPE = "bible-semantic-view";

export class BibleView extends ItemView {
  plugin: BibleSemanticPlugin;
  private mode: ReaderMode;
  private activePanel: ActivePanel = "none";
  private activeLeftModule: LeftModule = "lexicon";
  private activeRightModule: RightModule = "writing_pad";
  private selectedVerseUuid: string | null = null;
  private currentDatasetId: string = "genesis-1";

  constructor(leaf: WorkspaceLeaf, plugin: BibleSemanticPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.mode = plugin.settings.defaultMode;
  }

  getViewType(): string {
    return BIBLE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Bible Semantic Workspace";
  }

  getIcon(): string {
    return "book-open";
  }

  async onOpen(): Promise<void> {
    this.render();
  }

  async onClose(): Promise<void> {
    // cleanup
  }

  setDataset(id: string): void {
    this.currentDatasetId = id;
    this.selectedVerseUuid = null;
    this.render();
  }

  private render(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("bsw-root");

    // ── Toolbar ──
    const toolbar = container.createDiv({ cls: "bsw-toolbar" });
    this.renderToolbar(toolbar);

    // ── Main Layout ──
    const layout = container.createDiv({ cls: "bsw-layout" });

    // Left Panel
    if (this.activePanel === "left") {
      const leftEl = layout.createDiv({ cls: "bsw-panel bsw-panel-left" });
      renderLeftPanel(leftEl, this.plugin, this.activeLeftModule, this.selectedVerseUuid, (mod: LeftModule) => {
        this.activeLeftModule = mod;
        this.render();
      });
    }

    // Scripture pane (always visible)
    const scripturePane = layout.createDiv({ cls: "bsw-scripture-pane" });
    this.renderScripture(scripturePane);

    // Right Panel
    if (this.activePanel === "right") {
      const rightEl = layout.createDiv({ cls: "bsw-panel bsw-panel-right" });
      renderRightPanel(rightEl, this.plugin, this.activeRightModule, this.selectedVerseUuid, (mod: RightModule) => {
        this.activeRightModule = mod;
        this.render();
      });
    }
  }

  private renderToolbar(toolbar: HTMLElement): void {
    // Dataset selector
    const dsSelect = toolbar.createEl("select", { cls: "bsw-dataset-select" });
    for (const id of this.plugin.store.getDatasetIds()) {
      const opt = dsSelect.createEl("option", { text: id, value: id });
      if (id === this.currentDatasetId) opt.selected = true;
    }
    dsSelect.addEventListener("change", () => {
      this.setDataset(dsSelect.value);
    });

    // Mode buttons
    const modeGroup = toolbar.createDiv({ cls: "bsw-mode-group" });
    for (const m of ["reading", "overlay", "deep"] as ReaderMode[]) {
      const btn = modeGroup.createEl("button", {
        text: m.charAt(0).toUpperCase() + m.slice(1),
        cls: `bsw-mode-btn ${this.mode === m ? "bsw-mode-active" : ""}`,
      });
      btn.addEventListener("click", () => {
        this.mode = m;
        this.render();
      });
    }

    // Panel info
    if (this.activePanel !== "none") {
      const closeBtn = toolbar.createEl("button", { text: "Close Panel", cls: "bsw-close-panel-btn" });
      closeBtn.addEventListener("click", () => {
        this.activePanel = "none";
        this.render();
      });
    }
  }

  private renderScripture(pane: HTMLElement): void {
    const dataset = this.plugin.store.getDataset(this.currentDatasetId);
    if (!dataset) {
      pane.createEl("p", { text: "No dataset loaded." });
      return;
    }

    // Get chapter segments
    const chapters = dataset.segments.filter((s) => s.level === "chapter");
    if (chapters.length === 0) {
      pane.createEl("p", { text: "No chapters found." });
      return;
    }

    for (const chapter of chapters) {
      const chapterEl = pane.createDiv({ cls: "bsw-chapter" });
      chapterEl.createEl("h2", { text: chapter.content, cls: "bsw-chapter-title" });

      const paragraphs = getParagraphs(dataset, chapter.segment_uuid);
      for (const para of paragraphs) {
        const paraEl = chapterEl.createDiv({ cls: "bsw-paragraph" });
        const verses = getVerses(dataset, para.segment_uuid);

        for (const verse of verses) {
          this.renderVerse(paraEl, verse);
        }
      }
    }
  }

  private renderVerse(container: HTMLElement, verse: Segment): void {
    const isSelected = this.selectedVerseUuid === verse.segment_uuid;
    const verseEl = container.createDiv({
      cls: `bsw-verse ${isSelected ? "bsw-verse-selected" : ""}`,
    });
    verseEl.dataset.uuid = verse.segment_uuid;

    const annotations = this.plugin.store.getAnnotations(verse.segment_uuid);
    const links = this.plugin.store.getLinks(verse.segment_uuid);
    const annotationCount = annotations.length;

    // ── Inline Controls ──
    const controls = verseEl.createDiv({ cls: "bsw-inline-controls" });

    // LEFT button
    const leftBtn = controls.createEl("button", {
      text: "\u25C0",
      cls: "bsw-ctrl-btn bsw-ctrl-left",
      attr: { "aria-label": "Open left panel", title: "Left panel: Lexicon, People, Timeline..." },
    });
    leftBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selectedVerseUuid = verse.segment_uuid;
      this.activePanel = this.activePanel === "left" ? "none" : "left";
      this.render();
    });

    // SEMANTIC TOGGLE button
    const semBtn = controls.createEl("button", {
      text: "\u271A",
      cls: `bsw-ctrl-btn bsw-ctrl-sem ${this.mode !== "reading" ? "bsw-ctrl-sem-active" : ""}`,
      attr: { "aria-label": "Toggle semantic overlay", title: "Toggle semantic overlay" },
    });
    semBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selectedVerseUuid = verse.segment_uuid;
      if (this.mode === "reading") {
        this.mode = "overlay";
      } else if (this.mode === "overlay") {
        this.mode = "deep";
      } else {
        this.mode = "reading";
      }
      this.render();
    });

    // RIGHT button
    const rightBtn = controls.createEl("button", {
      text: "\u25B6",
      cls: "bsw-ctrl-btn bsw-ctrl-right",
      attr: { "aria-label": "Open right panel", title: "Right panel: Chat, Writing, Notes..." },
    });
    rightBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selectedVerseUuid = verse.segment_uuid;
      this.activePanel = this.activePanel === "right" ? "none" : "right";
      this.render();
    });

    // ── Verse Content ──
    const contentEl = verseEl.createDiv({ cls: "bsw-verse-content" });

    // Verse number
    if (this.plugin.settings.showVerseNumbers) {
      const vnum = getVerseNumber(verse.verse_uuid ?? verse.segment_uuid);
      contentEl.createEl("sup", { text: vnum, cls: "bsw-verse-num" });
    }

    // Text content with semantic annotations
    if (this.mode === "reading") {
      contentEl.createSpan({ text: verse.content, cls: "bsw-text-clean" });
    } else {
      this.renderAnnotatedText(contentEl, verse, annotations);
    }

    // ── Badge Count (overlay + deep) ──
    if (this.mode !== "reading" && annotationCount > 0) {
      const badge = verseEl.createEl("span", {
        text: String(annotationCount),
        cls: "bsw-badge",
        attr: { "aria-label": `${annotationCount} classifications` },
      });
    }

    // ── Tooltip on hover ──
    if (annotations.length > 0) {
      const tooltipLines = [
        `UUID: ${verse.segment_uuid}`,
        `Classes: ${this.plugin.store.getAllClassCodes(verse.segment_uuid).join(", ")}`,
        `Confidence: ${this.plugin.store.getTopConfidence(verse.segment_uuid) ?? "N/A"}`,
        `Annotations: ${annotationCount}`,
      ];
      if (links.length > 0) {
        tooltipLines.push(`Cross-refs: ${links.length}`);
      }
      verseEl.title = tooltipLines.join("\n");
    }

    // Click to select
    verseEl.addEventListener("click", () => {
      this.selectedVerseUuid = verse.segment_uuid;
      this.render();
    });
  }

  private renderAnnotatedText(container: HTMLElement, verse: Segment, annotations: Annotation[]): void {
    const textSpan = container.createSpan({ cls: "bsw-text-annotated" });
    textSpan.textContent = verse.content;

    if (this.mode === "overlay") {
      // Overlay: subtle underline markers
      for (const ann of annotations) {
        const entityColor = ann.entity[0] ? ENTITY_COLORS[ann.entity[0]] : "#666";
        textSpan.style.borderBottom = `2px solid ${entityColor}`;
        textSpan.style.borderBottomStyle = EVIDENCE_BORDERS[ann.evidence_status] || "solid";
      }
    }

    if (this.mode === "deep") {
      // Deep: show chips for each annotation
      textSpan.style.borderBottom = "none";
      const chipContainer = container.createDiv({ cls: "bsw-chip-container" });
      for (const ann of annotations) {
        const chip = chipContainer.createDiv({ cls: "bsw-chip" });
        const entityColor = ann.entity[0] ? ENTITY_COLORS[ann.entity[0]] : "#666";
        chip.style.backgroundColor = entityColor + "22";
        chip.style.borderColor = entityColor;
        chip.style.borderStyle = EVIDENCE_BORDERS[ann.evidence_status] || "solid";

        // Role icon
        const roleIcon = ann.role[0] ? ROLE_ICONS[ann.role[0]] : "";
        if (roleIcon) {
          chip.createSpan({ text: roleIcon, cls: "bsw-chip-icon" });
        }

        // Entity labels
        chip.createSpan({ text: ann.entity.join(", "), cls: "bsw-chip-entity" });

        // Class codes
        if (ann.class_code && ann.class_code.length > 0) {
          const ccSpan = chip.createSpan({ text: ` [${ann.class_code.join(", ")}]`, cls: "bsw-chip-class" });
        }

        // Confidence
        if (ann.confidence !== undefined) {
          chip.createSpan({
            text: ` ${Math.round(ann.confidence * 100)}%`,
            cls: "bsw-chip-confidence",
          });
        }

        // Note tooltip
        if (ann.note) {
          chip.title = ann.note;
        }
      }
    }
  }
}
