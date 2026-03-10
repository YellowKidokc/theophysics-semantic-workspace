import type { BibleDataset, Annotation, Segment, SegmentLink } from "../types";

/**
 * Excel interop stubs for import/export of Bible semantic data.
 * Full implementation would use a library like SheetJS (xlsx).
 */

export interface ExcelRow {
  [key: string]: string | number | boolean | null;
}

/** Export segments to a flat array of rows suitable for CSV/Excel */
export function exportSegmentsToRows(segments: Segment[]): ExcelRow[] {
  return segments.map((s) => ({
    segment_uuid: s.segment_uuid,
    level: s.level,
    parent_uuid: s.parent_uuid ?? "",
    content: s.content,
    index_in_parent: s.index_in_parent,
    book_uuid: s.book_uuid ?? "",
    chapter_uuid: s.chapter_uuid ?? "",
    verse_uuid: s.verse_uuid ?? "",
    paragraph_uuid: s.paragraph_uuid ?? "",
    surface_text: s.surface_text ?? "",
    lemma: s.lemma ?? "",
    strongs: s.strongs ?? "",
    pos: s.pos ?? "",
    lang: s.lang ?? "",
  }));
}

/** Export annotations to flat rows */
export function exportAnnotationsToRows(annotations: Annotation[]): ExcelRow[] {
  return annotations.map((a) => ({
    annotation_uuid: a.annotation_uuid,
    segment_uuid: a.segment_uuid,
    entity: a.entity.join(";"),
    role: a.role.join(";"),
    evidence_status: a.evidence_status,
    time_scope: (a.time_scope ?? []).join(";"),
    ops_status: (a.ops_status ?? []).join(";"),
    class_code: (a.class_code ?? []).join(";"),
    confidence: a.confidence ?? 0,
    status: a.status ?? "",
    note: a.note ?? "",
    provenance_method: a.provenance?.method ?? "",
    provenance_author: a.provenance?.author ?? "",
  }));
}

/** Export links to flat rows */
export function exportLinksToRows(links: SegmentLink[]): ExcelRow[] {
  return links.map((l) => ({
    link_uuid: l.link_uuid,
    from_segment_uuid: l.from_segment_uuid,
    to_target_id: l.to_target_id,
    link_type: l.link_type,
    weight: l.weight ?? 0,
    note: l.note ?? "",
  }));
}

/** Convert rows array to CSV string */
export function rowsToCSV(rows: ExcelRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    });
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

/** Stub: import segments from CSV rows (parse header + data) */
export function importSegmentsFromCSV(csv: string): Segment[] {
  const lines = csv.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  const segments: Segment[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] ?? "").trim();
    });
    segments.push({
      segment_uuid: obj["segment_uuid"] ?? "",
      level: (obj["level"] ?? "verse") as Segment["level"],
      parent_uuid: obj["parent_uuid"] || null,
      content: obj["content"] ?? "",
      index_in_parent: parseInt(obj["index_in_parent"] ?? "0", 10),
      book_uuid: obj["book_uuid"] || null,
      chapter_uuid: obj["chapter_uuid"] || null,
      verse_uuid: obj["verse_uuid"] || null,
      paragraph_uuid: obj["paragraph_uuid"] || null,
    });
  }
  return segments;
}

/** Full export of a dataset to multiple CSV sheets */
export function exportDatasetToCSVs(dataset: BibleDataset): Record<string, string> {
  return {
    "segments.csv": rowsToCSV(exportSegmentsToRows(dataset.segments)),
    "annotations.csv": rowsToCSV(exportAnnotationsToRows(dataset.annotations)),
    "links.csv": rowsToCSV(exportLinksToRows(dataset.links)),
  };
}
