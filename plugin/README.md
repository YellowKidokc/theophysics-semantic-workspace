# Bible Semantic Workspace (Theophysics) - Obsidian Plugin

A Bible-first research workspace where Scripture remains the primary text, with semantic analysis and writing tools layered on demand.

## Install

### From Source

```bash
cd plugin
npm install
npm run build
```

Copy `main.js`, `manifest.json`, and `styles.css` to your Obsidian vault:

```
<vault>/.obsidian/plugins/bible-semantic-workspace/
  main.js
  manifest.json
  styles.css
```

Enable the plugin in Obsidian Settings > Community Plugins.

### Development

```bash
cd plugin
npm install
npm run dev
```

This watches for changes and rebuilds automatically.

## Usage

1. Click the book icon in the ribbon, or use the command palette: "Open Bible Semantic Workspace"
2. Select a dataset (Genesis 1 or Genesis 11) from the dropdown
3. Read Scripture in paragraph-first layout
4. Hover over any verse to reveal inline controls: **left arrow** | **cross** | **right arrow**

### Inline Controls

| Button | Action |
|--------|--------|
| **left arrow** | Opens LEFT panel (Lexicon, People/Places/Things, Timeline, Cross-Refs, Themes, Claim/Evidence) |
| **cross** | Toggles semantic overlay mode (Reading > Overlay > Deep > Reading) |
| **right arrow** | Opens RIGHT panel (Chat, Writing Pad, Notes, Export) |

### Modes

- **Reading**: Clean text, no highlights
- **Overlay**: Lightweight underline markers showing entity type + evidence status
- **Deep**: Full annotation chips with icons, badges, class codes, and confidence scores

### Side Panels

Left and right panels are **mutually exclusive** - only one can be open at a time.

#### Left Panel Modules
- **Lexicon**: Segment UUID, lemma, Strong's numbers, part of speech, language
- **People/Places/Things**: Filtered annotations by entity type with color coding
- **Timeline**: Time-scoped annotations
- **Cross-References**: Linked passages with relevance scores
- **Themes**: Theme-tagged annotations
- **Claim/Evidence**: Claims with evidence status and linked evidence

#### Right Panel Modules
- **Chat**: Placeholder for AI assistant integration
- **Writing Pad**: Free-form writing area with research co-partner session launcher
- **Notes**: Existing annotation notes + user notes
- **Export**: JSON, CSV, and session export

### Research Co-Partner

Start a structured research session from the Writing Pad:

1. State your belief/research question
2. Set your current lean and confidence level
3. Add hypotheses with arguments for and against
4. Add evidence with source, claim, direction, and strength
5. Finalize to get:
   - Steelmanned alternatives
   - Strongest objection to your current lean
   - Facts vs interpretation vs values breakdown
   - Structured session JSON output

### Settings

Configure in Obsidian Settings > Bible Semantic Workspace:
- Default reading mode
- Verse number visibility
- Module visibility and ordering for both panels
- Default book and chapter

## Data

Sample datasets included:
- `genesis-1.json`: Genesis chapter 1 (31 verses, 12 annotations, 5 cross-references)
- `genesis-11.json`: Genesis chapter 11 (32 verses, 11 annotations, 4 cross-references)

### Schemas

See `specs/semantic-workspace/schemas/` for JSON schemas:
- `segment.schema.json`: Text segments (word through corpus)
- `annotation.schema.json`: Multi-value classification annotations
- `dataset.schema.json`: Complete dataset with segments, annotations, and links
- `session-output.schema.json`: Research co-partner session output

## Architecture

```
plugin/src/
  main.ts                    # Plugin entry point
  types.ts                   # TypeScript types from schemas
  settings.ts                # Settings tab
  data/
    genesis-1.json           # Sample dataset
    genesis-11.json          # Sample dataset
    loader.ts                # Data loading utilities
  views/
    BibleView.ts             # Main reading view (ItemView)
    LeftPanel.ts             # Left panel modules
    RightPanel.ts            # Right panel modules
  services/
    AnnotationStore.ts       # Indexed annotation storage
    SessionManager.ts        # Research co-partner sessions
    ExcelInterop.ts          # CSV/Excel import/export stubs
```

## Excel Interop

CSV export is built in. For full `.xlsx` support, integrate the SheetJS (xlsx) library. The `ExcelInterop.ts` module provides:
- `exportSegmentsToRows()` / `exportAnnotationsToRows()` / `exportLinksToRows()`
- `rowsToCSV()` for CSV generation
- `importSegmentsFromCSV()` stub for CSV import
- `exportDatasetToCSVs()` for full dataset export

## Portability

The semantic core (types, schemas, annotation store, session manager) is decoupled from Obsidian APIs. The same core can be reused in Forge, web, or other platforms.
