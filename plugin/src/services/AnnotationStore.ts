import type { BibleDataset, Annotation, Segment, SegmentLink } from "../types";
import { loadDataset, getAvailableDatasets } from "../data/loader";

export class AnnotationStore {
  private datasets: Map<string, BibleDataset> = new Map();
  private segmentIndex: Map<string, Segment> = new Map();
  private annotationsBySegment: Map<string, Annotation[]> = new Map();
  private linksBySegment: Map<string, SegmentLink[]> = new Map();

  loadAll(): void {
    for (const id of getAvailableDatasets()) {
      const ds = loadDataset(id);
      if (ds) {
        this.datasets.set(id, ds);
        this.indexDataset(ds);
      }
    }
  }

  private indexDataset(ds: BibleDataset): void {
    for (const seg of ds.segments) {
      this.segmentIndex.set(seg.segment_uuid, seg);
    }
    for (const ann of ds.annotations) {
      const existing = this.annotationsBySegment.get(ann.segment_uuid) ?? [];
      existing.push(ann);
      this.annotationsBySegment.set(ann.segment_uuid, existing);
    }
    for (const link of ds.links) {
      const existing = this.linksBySegment.get(link.from_segment_uuid) ?? [];
      existing.push(link);
      this.linksBySegment.set(link.from_segment_uuid, existing);
    }
  }

  getDataset(id: string): BibleDataset | undefined {
    return this.datasets.get(id);
  }

  getSegment(uuid: string): Segment | undefined {
    return this.segmentIndex.get(uuid);
  }

  getAnnotations(segmentUuid: string): Annotation[] {
    return this.annotationsBySegment.get(segmentUuid) ?? [];
  }

  getLinks(segmentUuid: string): SegmentLink[] {
    return this.linksBySegment.get(segmentUuid) ?? [];
  }

  getAnnotationCount(segmentUuid: string): number {
    return this.getAnnotations(segmentUuid).length;
  }

  getAllClassCodes(segmentUuid: string): string[] {
    const codes = new Set<string>();
    for (const ann of this.getAnnotations(segmentUuid)) {
      if (ann.class_code) {
        for (const c of ann.class_code) codes.add(c);
      }
    }
    return Array.from(codes);
  }

  getTopConfidence(segmentUuid: string): number | null {
    const anns = this.getAnnotations(segmentUuid);
    if (anns.length === 0) return null;
    return Math.max(...anns.map((a) => a.confidence ?? 0));
  }

  getDatasetIds(): string[] {
    return Array.from(this.datasets.keys());
  }
}
