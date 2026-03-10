// ── Scope Levels ──
export type ScopeLevel = "word" | "sentence" | "paragraph" | "verse" | "chapter" | "book" | "corpus";

// ── Reader Modes ──
export type ReaderMode = "reading" | "overlay" | "deep";

// ── Classification Facets ──
export type EntityType = "person" | "place" | "object" | "concept" | "event" | "claim" | "source" | "law" | "equation";
export type RoleType = "definition" | "action" | "relation" | "cause" | "effect" | "constraint" | "exception" | "bridge" | "direct_mapping" | "warning" | "unresolved";
export type EvidenceStatus = "asserted" | "provisional" | "verified" | "disputed" | "unresolved";
export type TimeScope = "timeless" | "historical" | "sequence_point" | "duration" | "prophetic" | "projected";
export type OpsStatus = "needs_source" | "needs_review" | "canonical" | "publish_ready" | "deprecated" | "blocked";
export type ContextDomain = "bible" | "theology" | "physics" | "law" | "general";
export type ProvenanceMethod = "manual" | "ai" | "import";
export type ClassCode = "axiom" | "tag" | "definition" | "theme" | "person" | "place" | "object" | "event" | "timeline" | "crossref" | "concept" | "claim" | "source" | "law" | "equation" | "evidence";
export type LinkType = "claim" | "evidence" | "source" | "note" | "definition" | "crossref" | "action" | "map";
export type RecordStatus = "verified" | "provisional" | "unverified";

// ── Segment ──
export interface Segment {
  segment_uuid: string;
  level: ScopeLevel;
  parent_uuid: string | null;
  content: string;
  index_in_parent: number;
  testament_uuid?: string | null;
  book_uuid?: string | null;
  chapter_uuid?: string | null;
  verse_uuid?: string | null;
  paragraph_uuid?: string | null;
  sentence_uuid?: string | null;
  word_uuid?: string | null;
  surface_text?: string | null;
  lemma?: string | null;
  strongs?: string | null;
  pos?: string | null;
  lang?: string | null;
}

// ── Annotation ──
export interface Annotation {
  annotation_uuid: string;
  segment_uuid: string;
  entity: EntityType[];
  role: RoleType[];
  evidence_status: EvidenceStatus;
  time_scope?: TimeScope[];
  ops_status?: OpsStatus[];
  context?: {
    domain?: ContextDomain;
    tradition_or_framework?: string | null;
    audience?: string | null;
    language_register?: string | null;
  };
  provenance?: {
    author?: string | null;
    method: ProvenanceMethod;
    timestamp?: string | null;
    source_path?: string | null;
    revision?: string | null;
  };
  class_code?: ClassCode[];
  confidence?: number;
  status?: RecordStatus;
  note?: string | null;
}

// ── Link ──
export interface SegmentLink {
  link_uuid: string;
  from_segment_uuid: string;
  to_target_id: string;
  link_type: LinkType;
  weight?: number;
  note?: string | null;
}

// ── Dataset ──
export interface BibleDataset {
  dataset_id: string;
  domain: ContextDomain;
  ingest_profile: {
    segmentation: "paragraph-first" | "sentence-first" | "verse-first";
    enabled_levels: ScopeLevel[];
  };
  segments: Segment[];
  annotations: Annotation[];
  links: SegmentLink[];
  sources?: Record<string, unknown>[];
  claims?: Record<string, unknown>[];
}

// ── Co-Partner Session ──
export interface Hypothesis {
  hypothesis_id: string;
  label: string;
  best_for: string[];
  best_against: string[];
}

export interface EvidenceEntry {
  source: string;
  claim: string;
  direction: "supports" | "opposes" | "mixed";
  strength: number;
  notes?: string | null;
}

export interface CoPartnerSession {
  session_id: string;
  belief_statement: string;
  user_lean_before?: string | null;
  user_lean_after?: string | null;
  confidence_before: number;
  confidence_after: number;
  hypotheses: Hypothesis[];
  evidence_matrix: EvidenceEntry[];
  unresolved_objections?: string[];
  provisional_conclusion: string;
  flip_conditions: string[];
  next_actions?: string[];
}

// ── Left Panel Modules ──
export type LeftModule = "lexicon" | "people_places_things" | "timeline" | "crossrefs" | "themes" | "claim_evidence";
export type RightModule = "chat" | "writing_pad" | "notes" | "export";

// ── Panel State ──
export type ActivePanel = "none" | "left" | "right";

// ── Settings ──
export interface BibleWorkspaceSettings {
  defaultMode: ReaderMode;
  leftModuleOrder: LeftModule[];
  rightModuleOrder: RightModule[];
  leftModuleVisibility: Record<LeftModule, boolean>;
  rightModuleVisibility: Record<RightModule, boolean>;
  showVerseNumbers: boolean;
  defaultBook: string;
  defaultChapter: number;
}

export const DEFAULT_SETTINGS: BibleWorkspaceSettings = {
  defaultMode: "reading",
  leftModuleOrder: ["lexicon", "people_places_things", "timeline", "crossrefs", "themes", "claim_evidence"],
  rightModuleOrder: ["chat", "writing_pad", "notes", "export"],
  leftModuleVisibility: {
    lexicon: true,
    people_places_things: true,
    timeline: true,
    crossrefs: true,
    themes: true,
    claim_evidence: true,
  },
  rightModuleVisibility: {
    chat: true,
    writing_pad: true,
    notes: true,
    export: true,
  },
  showVerseNumbers: true,
  defaultBook: "Genesis",
  defaultChapter: 1,
};

// ── Visual Grammar ──
export const ENTITY_COLORS: Record<EntityType, string> = {
  person: "#4a90d9",
  place: "#50b77d",
  object: "#e6a23c",
  concept: "#9b59b6",
  event: "#e74c3c",
  claim: "#f39c12",
  source: "#1abc9c",
  law: "#8e44ad",
  equation: "#2c3e50",
};

export const ROLE_ICONS: Record<RoleType, string> = {
  definition: "\u25cf",
  action: "\u25b6",
  relation: "\u2194",
  cause: "\u2191",
  effect: "\u2193",
  constraint: "\u2016",
  exception: "\u203c",
  bridge: "\u2261",
  direct_mapping: "\u2192",
  warning: "\u26a0",
  unresolved: "\u003f",
};

export const EVIDENCE_BORDERS: Record<EvidenceStatus, string> = {
  asserted: "solid",
  provisional: "dashed",
  verified: "double",
  disputed: "dotted",
  unresolved: "ridge",
};
