import { Plugin } from "obsidian";
import type { BibleWorkspaceSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { BibleView, BIBLE_VIEW_TYPE } from "./views/BibleView";
import { BibleWorkspaceSettingTab } from "./settings";
import { AnnotationStore } from "./services/AnnotationStore";
import { SessionManager } from "./services/SessionManager";

export default class BibleSemanticPlugin extends Plugin {
  settings: BibleWorkspaceSettings = DEFAULT_SETTINGS;
  store: AnnotationStore = new AnnotationStore();
  sessionManager: SessionManager = new SessionManager();

  async onload(): Promise<void> {
    await this.loadSettings();

    // Load data
    this.store.loadAll();

    // Register the Bible view
    this.registerView(BIBLE_VIEW_TYPE, (leaf) => new BibleView(leaf, this));

    // Add ribbon icon
    this.addRibbonIcon("book-open", "Open Bible Workspace", () => {
      this.activateView();
    });

    // Add command
    this.addCommand({
      id: "open-bible-workspace",
      name: "Open Bible Semantic Workspace",
      callback: () => {
        this.activateView();
      },
    });

    // Add settings tab
    this.addSettingTab(new BibleWorkspaceSettingTab(this.app, this));
  }

  onunload(): void {
    // Cleanup
  }

  async activateView(): Promise<void> {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(BIBLE_VIEW_TYPE)[0];

    if (!leaf) {
      const newLeaf = workspace.getLeaf("tab");
      if (newLeaf) {
        await newLeaf.setViewState({
          type: BIBLE_VIEW_TYPE,
          active: true,
        });
        leaf = newLeaf;
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
