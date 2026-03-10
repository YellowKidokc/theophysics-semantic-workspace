import { App, PluginSettingTab, Setting } from "obsidian";
import type BibleSemanticPlugin from "./main";
import type { BibleWorkspaceSettings, LeftModule, RightModule, ReaderMode } from "./types";

const LEFT_MODULE_LABELS: Record<LeftModule, string> = {
  lexicon: "Lexicon",
  people_places_things: "People / Places / Things",
  timeline: "Timeline",
  crossrefs: "Cross-References",
  themes: "Themes",
  claim_evidence: "Claim / Evidence Links",
};

const RIGHT_MODULE_LABELS: Record<RightModule, string> = {
  chat: "Chat (placeholder)",
  writing_pad: "Writing Pad",
  notes: "Notes",
  export: "Export",
};

export class BibleWorkspaceSettingTab extends PluginSettingTab {
  plugin: BibleSemanticPlugin;

  constructor(app: App, plugin: BibleSemanticPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Bible Semantic Workspace Settings" });

    new Setting(containerEl)
      .setName("Default mode")
      .setDesc("Reading mode when opening a new view")
      .addDropdown((dd) =>
        dd
          .addOption("reading", "Reading")
          .addOption("overlay", "Overlay")
          .addOption("deep", "Deep")
          .setValue(this.plugin.settings.defaultMode)
          .onChange(async (value) => {
            this.plugin.settings.defaultMode = value as ReaderMode;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show verse numbers")
      .setDesc("Display verse numbers inline")
      .addToggle((t) =>
        t.setValue(this.plugin.settings.showVerseNumbers).onChange(async (value) => {
          this.plugin.settings.showVerseNumbers = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Default book")
      .addText((t) =>
        t.setValue(this.plugin.settings.defaultBook).onChange(async (value) => {
          this.plugin.settings.defaultBook = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Default chapter")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.defaultChapter)).onChange(async (value) => {
          this.plugin.settings.defaultChapter = parseInt(value, 10) || 1;
          await this.plugin.saveSettings();
        })
      );

    containerEl.createEl("h3", { text: "Left panel modules" });
    for (const mod of this.plugin.settings.leftModuleOrder) {
      new Setting(containerEl)
        .setName(LEFT_MODULE_LABELS[mod])
        .addToggle((t) =>
          t.setValue(this.plugin.settings.leftModuleVisibility[mod]).onChange(async (value) => {
            this.plugin.settings.leftModuleVisibility[mod] = value;
            await this.plugin.saveSettings();
          })
        );
    }

    containerEl.createEl("h3", { text: "Right panel modules" });
    for (const mod of this.plugin.settings.rightModuleOrder) {
      new Setting(containerEl)
        .setName(RIGHT_MODULE_LABELS[mod])
        .addToggle((t) =>
          t.setValue(this.plugin.settings.rightModuleVisibility[mod]).onChange(async (value) => {
            this.plugin.settings.rightModuleVisibility[mod] = value;
            await this.plugin.saveSettings();
          })
        );
    }
  }
}
