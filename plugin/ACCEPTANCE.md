# Acceptance Checklist

## Core Requirements

- [x] Main reading view is paragraph-first Scripture (clean reading)
- [x] Inline controls per verse: left arrow, cross, right arrow
- [x] Left and right panels are mutually exclusive (only one open at once)
- [x] Cross toggles semantic overlay without opening side panels
- [x] One token/segment can carry many classifications (20+), rendered cleanly

## Left Panel Modules

- [x] Lexicon (UUID, lemma, Strong's, POS, language, annotations)
- [x] People/Places/Things (filtered by entity type, color coded)
- [x] Timeline (time-scoped annotations)
- [x] Cross-References (linked passages with relevance)
- [x] Themes (theme-tagged annotations)
- [x] Claim/Evidence Links (claims with status, evidence links)

## Right Panel Modules

- [x] Chat (placeholder with disabled UI)
- [x] Writing Pad (free-form textarea, co-partner launcher)
- [x] Notes (existing annotation notes + user notes area)
- [x] Export (JSON, CSV, session JSON download)

## Reader Modes

- [x] Reading: no highlights, clean text
- [x] Overlay: lightweight underline markers (color = entity, style = evidence status)
- [x] Deep: full chips/icons/badges with entity, role, class codes, confidence

## Scope Model

- [x] word level supported in schema
- [x] sentence level supported in schema
- [x] paragraph level (used for paragraph-first layout)
- [x] verse level (primary display unit)
- [x] chapter level (grouping)
- [x] book level (top-level)
- [x] corpus level supported in schema (OT/NT/Bible)

## UUID Hierarchy

- [x] testament_uuid
- [x] book_uuid
- [x] chapter_uuid
- [x] verse_uuid
- [x] sentence_uuid
- [x] paragraph_uuid
- [x] word_uuid

## Classification Facets (Multi-Value)

- [x] A) entity: person, place, object, concept, event, claim, source, law, equation
- [x] B) role: definition, action, relation, cause, effect, constraint, exception, bridge, direct_mapping
- [x] C) evidence_status: asserted, provisional, verified, disputed, unresolved
- [x] D) time_scope: timeless, historical, sequence_point, duration, prophetic
- [x] E) ops_status: needs_source, needs_review, canonical, publish_ready, deprecated
- [x] F) context: domain, tradition/framework, audience, language
- [x] G) provenance: author, method(manual/ai/import), timestamp, source_path, revision

## Visual Grammar

- [x] Color = family/category (entity type colors)
- [x] Shape/Icon = role (role icons: circle, arrow, double-arrow, etc.)
- [x] Border = evidence/confidence state (solid, dashed, double, dotted, ridge)
- [x] Badge count = number of attached classifications
- [x] Accessibility: focus-visible outlines, never color alone (icons + text labels)

## Data

- [x] Local JSON loader for Genesis 1 sample
- [x] Local JSON loader for Genesis 11 sample
- [x] Tooltips on hover: UUID + top classes + confidence
- [x] Annotation count badges

## Settings

- [x] Module visibility toggles
- [x] Mode defaults
- [x] Persisted in Obsidian plugin data (loadData/saveData)

## Research Co-Partner

- [x] User-facing flow: belief/research question input
- [x] Tracks confidence before/after
- [x] Add hypotheses with for/against
- [x] Add evidence with source, claim, direction, strength
- [x] Hidden routine: steelman alternatives
- [x] Hidden routine: present strongest objection to current lean
- [x] Hidden routine: separate facts vs interpretation vs values
- [x] Log sources/claims automatically via evidence matrix
- [x] Output structured session JSON

## Deliverables

- [x] Working Obsidian plugin code (typed, modular)
- [x] README with install/run
- [x] Sample Bible datasets (Genesis 1 + 11)
- [x] JSON schemas for segment + annotation + session output
- [x] Acceptance checklist (this file)
- [x] Excel interop note + importer/exporter stubs

## Constraints

- [x] Desktop-first (320px panels, max-width scripture)
- [x] Responsive support (media query at 768px)
- [x] No paid external services
- [x] Architecture portable (semantic core decoupled from Obsidian)
