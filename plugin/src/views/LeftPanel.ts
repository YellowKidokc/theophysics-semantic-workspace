import type BibleSemanticPlugin from "../main";
import type { LeftModule, Annotation, SegmentLink } from "../types";
import { ENTITY_COLORS, ROLE_ICONS, EVIDENCE_BORDERS } from "../types";

const LEFT_MODULE_LABELS: Record<LeftModule, string> = {
  lexicon: "Lexicon",
  people_places_things: "People / Places / Things",
  timeline: "Timeline",
  crossrefs: "Cross-References",
  themes: "Themes",
  claim_evidence: "Claim / Evidence",
};

const LEFT_MODULE_ICONS: Record<LeftModule, string> = {
  lexicon: "book",
  people_places_things: "users",
  timeline: "clock",
  crossrefs: "link",
  themes: "palette",
  claim_evidence: "scale",
};

export function renderLeftPanel(
  container: HTMLElement,
  plugin: BibleSemanticPlugin,
  activeModule: LeftModule,
  selectedVerseUuid: string | null,
  onModuleChange: (mod: LeftModule) => void
): void {
  container.empty();

  // Module tabs
  const tabs = container.createDiv({ cls: "bsw-panel-tabs" });
  for (const mod of plugin.settings.leftModuleOrder) {
    if (!plugin.settings.leftModuleVisibility[mod]) continue;
    const tab = tabs.createEl("button", {
      text: LEFT_MODULE_LABELS[mod],
      cls: `bsw-panel-tab ${activeModule === mod ? "bsw-panel-tab-active" : ""}`,
      attr: { "aria-label": LEFT_MODULE_LABELS[mod] },
    });
    tab.addEventListener("click", () => onModuleChange(mod));
  }

  // Module content
  const content = container.createDiv({ cls: "bsw-panel-content" });

  if (!selectedVerseUuid) {
    content.createEl("p", { text: "Select a verse to see details.", cls: "bsw-panel-hint" });
    return;
  }

  const annotations = plugin.store.getAnnotations(selectedVerseUuid);
  const links = plugin.store.getLinks(selectedVerseUuid);
  const segment = plugin.store.getSegment(selectedVerseUuid);

  switch (activeModule) {
    case "lexicon":
      renderLexicon(content, segment, annotations);
      break;
    case "people_places_things":
      renderPPT(content, annotations);
      break;
    case "timeline":
      renderTimeline(content, annotations);
      break;
    case "crossrefs":
      renderCrossRefs(content, links);
      break;
    case "themes":
      renderThemes(content, annotations);
      break;
    case "claim_evidence":
      renderClaimEvidence(content, annotations, links);
      break;
  }
}

function renderLexicon(container: HTMLElement, segment: ReturnType<typeof import("../services/AnnotationStore").AnnotationStore.prototype.getSegment>, annotations: Annotation[]): void {
  container.createEl("h4", { text: "Lexicon" });
  if (!segment) {
    container.createEl("p", { text: "No segment data." });
    return;
  }

  const table = container.createEl("table", { cls: "bsw-lexicon-table" });
  const addRow = (label: string, value: string) => {
    const tr = table.createEl("tr");
    tr.createEl("td", { text: label, cls: "bsw-lex-label" });
    tr.createEl("td", { text: value, cls: "bsw-lex-value" });
  };

  addRow("UUID", segment.segment_uuid);
  addRow("Level", segment.level);
  if (segment.lemma) addRow("Lemma", segment.lemma);
  if (segment.strongs) addRow("Strong's", segment.strongs);
  if (segment.pos) addRow("Part of Speech", segment.pos);
  if (segment.lang) addRow("Language", segment.lang);
  addRow("Content", segment.content.slice(0, 100) + (segment.content.length > 100 ? "..." : ""));

  if (annotations.length > 0) {
    container.createEl("h5", { text: "Annotations" });
    for (const ann of annotations) {
      const div = container.createDiv({ cls: "bsw-lex-annotation" });
      div.createEl("strong", { text: ann.entity.join(", ") });
      div.createSpan({ text: ` (${ann.role.join(", ")})` });
      if (ann.note) {
        div.createEl("p", { text: ann.note, cls: "bsw-lex-note" });
      }
    }
  }
}

function renderPPT(container: HTMLElement, annotations: Annotation[]): void {
  container.createEl("h4", { text: "People / Places / Things" });

  const people = annotations.filter((a) => a.entity.includes("person"));
  const places = annotations.filter((a) => a.entity.includes("place"));
  const things = annotations.filter((a) => a.entity.includes("object"));

  if (people.length > 0) {
    container.createEl("h5", { text: "People" });
    for (const a of people) {
      const div = container.createDiv({ cls: "bsw-ppt-item" });
      div.style.borderLeft = `3px solid ${ENTITY_COLORS.person}`;
      div.createSpan({ text: a.note ?? a.entity.join(", ") });
      if (a.confidence !== undefined) {
        div.createSpan({ text: ` (${Math.round(a.confidence * 100)}%)`, cls: "bsw-confidence" });
      }
    }
  }

  if (places.length > 0) {
    container.createEl("h5", { text: "Places" });
    for (const a of places) {
      const div = container.createDiv({ cls: "bsw-ppt-item" });
      div.style.borderLeft = `3px solid ${ENTITY_COLORS.place}`;
      div.createSpan({ text: a.note ?? a.entity.join(", ") });
    }
  }

  if (things.length > 0) {
    container.createEl("h5", { text: "Objects" });
    for (const a of things) {
      const div = container.createDiv({ cls: "bsw-ppt-item" });
      div.style.borderLeft = `3px solid ${ENTITY_COLORS.object}`;
      div.createSpan({ text: a.note ?? a.entity.join(", ") });
    }
  }

  if (people.length === 0 && places.length === 0 && things.length === 0) {
    container.createEl("p", { text: "No people, places, or things annotated for this verse.", cls: "bsw-panel-hint" });
  }
}

function renderTimeline(container: HTMLElement, annotations: Annotation[]): void {
  container.createEl("h4", { text: "Timeline" });
  const timeAnns = annotations.filter((a) => a.time_scope && a.time_scope.length > 0);

  if (timeAnns.length === 0) {
    container.createEl("p", { text: "No timeline data for this verse.", cls: "bsw-panel-hint" });
    return;
  }

  for (const a of timeAnns) {
    const div = container.createDiv({ cls: "bsw-timeline-item" });
    div.createEl("strong", { text: (a.time_scope ?? []).join(", ") });
    if (a.note) div.createEl("p", { text: a.note });
  }
}

function renderCrossRefs(container: HTMLElement, links: SegmentLink[]): void {
  container.createEl("h4", { text: "Cross-References" });
  const crossrefs = links.filter((l) => l.link_type === "crossref");

  if (crossrefs.length === 0) {
    container.createEl("p", { text: "No cross-references for this verse.", cls: "bsw-panel-hint" });
    return;
  }

  const list = container.createEl("ul", { cls: "bsw-crossref-list" });
  for (const link of crossrefs) {
    const li = list.createEl("li", { cls: "bsw-crossref-item" });
    li.createEl("strong", { text: link.to_target_id });
    if (link.weight !== undefined) {
      li.createSpan({ text: ` (relevance: ${Math.round(link.weight * 100)}%)` });
    }
    if (link.note) {
      li.createEl("p", { text: link.note, cls: "bsw-crossref-note" });
    }
  }
}

function renderThemes(container: HTMLElement, annotations: Annotation[]): void {
  container.createEl("h4", { text: "Themes" });
  const themeAnns = annotations.filter((a) => a.class_code?.includes("theme"));

  if (themeAnns.length === 0) {
    container.createEl("p", { text: "No themes annotated for this verse.", cls: "bsw-panel-hint" });
    return;
  }

  for (const a of themeAnns) {
    const div = container.createDiv({ cls: "bsw-theme-item" });
    div.createEl("strong", { text: a.note ?? "Theme" });
    const codes = (a.class_code ?? []).join(", ");
    div.createSpan({ text: ` [${codes}]`, cls: "bsw-theme-codes" });
  }
}

function renderClaimEvidence(container: HTMLElement, annotations: Annotation[], links: SegmentLink[]): void {
  container.createEl("h4", { text: "Claims & Evidence" });

  const claims = annotations.filter((a) => a.entity.includes("claim") || a.class_code?.includes("claim"));
  const evidenceLinks = links.filter((l) => l.link_type === "evidence" || l.link_type === "claim");

  if (claims.length === 0 && evidenceLinks.length === 0) {
    container.createEl("p", { text: "No claims or evidence links for this verse.", cls: "bsw-panel-hint" });
    return;
  }

  if (claims.length > 0) {
    container.createEl("h5", { text: "Claims" });
    for (const c of claims) {
      const div = container.createDiv({ cls: "bsw-claim-item" });
      const statusIcon = EVIDENCE_BORDERS[c.evidence_status] || "solid";
      div.style.borderLeft = `3px ${statusIcon} ${ENTITY_COLORS.claim}`;
      div.createEl("strong", { text: c.evidence_status });
      if (c.note) div.createEl("p", { text: c.note });
    }
  }

  if (evidenceLinks.length > 0) {
    container.createEl("h5", { text: "Evidence Links" });
    for (const l of evidenceLinks) {
      const div = container.createDiv({ cls: "bsw-evidence-item" });
      div.createSpan({ text: `${l.link_type}: ${l.to_target_id}` });
      if (l.note) div.createEl("p", { text: l.note });
    }
  }
}
