import type { BibleDataset, Segment, Annotation, SegmentLink } from "../types";
import genesis1Data from "./genesis-1.json";
import genesis11Data from "./genesis-11.json";

const DATASETS: Record<string, BibleDataset> = {
  "genesis-1": genesis1Data as unknown as BibleDataset,
  "genesis-11": genesis11Data as unknown as BibleDataset,
};

export function getAvailableDatasets(): string[] {
  return Object.keys(DATASETS);
}

export function loadDataset(id: string): BibleDataset | null {
  return DATASETS[id] ?? null;
}

export function getChapterSegments(dataset: BibleDataset): Segment[] {
  return dataset.segments.filter((s) => s.level === "chapter");
}

export function getParagraphs(dataset: BibleDataset, chapterUuid: string): Segment[] {
  return dataset.segments
    .filter((s) => s.level === "paragraph" && s.parent_uuid === chapterUuid)
    .sort((a, b) => a.index_in_parent - b.index_in_parent);
}

export function getVerses(dataset: BibleDataset, paragraphUuid: string): Segment[] {
  return dataset.segments
    .filter((s) => s.level === "verse" && s.parent_uuid === paragraphUuid)
    .sort((a, b) => a.index_in_parent - b.index_in_parent);
}

export function getAnnotationsForSegment(dataset: BibleDataset, segmentUuid: string): Annotation[] {
  return dataset.annotations.filter((a) => a.segment_uuid === segmentUuid);
}

export function getLinksForSegment(dataset: BibleDataset, segmentUuid: string): SegmentLink[] {
  return dataset.links.filter((l) => l.from_segment_uuid === segmentUuid);
}

export function getVerseNumber(verseUuid: string): string {
  const parts = verseUuid.split("-");
  return parts[parts.length - 1];
}

export function getAllVerses(dataset: BibleDataset): Segment[] {
  return dataset.segments
    .filter((s) => s.level === "verse")
    .sort((a, b) => a.index_in_parent - b.index_in_parent);
}
