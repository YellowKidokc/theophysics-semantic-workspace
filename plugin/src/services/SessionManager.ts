import type { CoPartnerSession, Hypothesis, EvidenceEntry } from "../types";

function generateId(): string {
  return "sess-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export class SessionManager {
  private sessions: CoPartnerSession[] = [];

  createSession(beliefStatement: string, userLean: string | null, confidenceBefore: number): CoPartnerSession {
    const session: CoPartnerSession = {
      session_id: generateId(),
      belief_statement: beliefStatement,
      user_lean_before: userLean,
      user_lean_after: null,
      confidence_before: confidenceBefore,
      confidence_after: confidenceBefore,
      hypotheses: [],
      evidence_matrix: [],
      unresolved_objections: [],
      provisional_conclusion: "",
      flip_conditions: [],
      next_actions: [],
    };
    this.sessions.push(session);
    return session;
  }

  addHypothesis(sessionId: string, label: string, bestFor: string[], bestAgainst: string[]): Hypothesis | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    const h: Hypothesis = {
      hypothesis_id: "hyp-" + (session.hypotheses.length + 1),
      label,
      best_for: bestFor,
      best_against: bestAgainst,
    };
    session.hypotheses.push(h);
    return h;
  }

  addEvidence(sessionId: string, source: string, claim: string, direction: "supports" | "opposes" | "mixed", strength: number, notes?: string): EvidenceEntry | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    const e: EvidenceEntry = { source, claim, direction, strength, notes: notes ?? null };
    session.evidence_matrix.push(e);
    return e;
  }

  finalizeSession(sessionId: string, conclusion: string, userLeanAfter: string | null, confidenceAfter: number, flipConditions: string[], nextActions: string[]): void {
    const session = this.getSession(sessionId);
    if (!session) return;
    session.provisional_conclusion = conclusion;
    session.user_lean_after = userLeanAfter;
    session.confidence_after = confidenceAfter;
    session.flip_conditions = flipConditions;
    session.next_actions = nextActions;
  }

  getSession(sessionId: string): CoPartnerSession | undefined {
    return this.sessions.find((s) => s.session_id === sessionId);
  }

  getAllSessions(): CoPartnerSession[] {
    return [...this.sessions];
  }

  exportSessionJSON(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    if (!session) return null;
    return JSON.stringify(session, null, 2);
  }

  /** Hidden routine: steelman alternatives, present strongest objection */
  analyzeSession(sessionId: string): { steelmanNote: string; strongestObjection: string; factsVsInterpretation: string } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const opposingEvidence = session.evidence_matrix
      .filter((e) => e.direction === "opposes")
      .sort((a, b) => b.strength - a.strength);

    const strongestObjection = opposingEvidence.length > 0
      ? `Strongest objection (strength ${opposingEvidence[0].strength}): "${opposingEvidence[0].claim}" (source: ${opposingEvidence[0].source})`
      : "No opposing evidence recorded yet. Consider actively seeking counter-arguments.";

    const facts = session.evidence_matrix.filter((e) => e.strength >= 0.8);
    const interpretations = session.evidence_matrix.filter((e) => e.strength < 0.8 && e.strength >= 0.4);
    const values = session.evidence_matrix.filter((e) => e.strength < 0.4);

    const factsVsInterpretation = [
      `Facts (high confidence): ${facts.length} items`,
      `Interpretations (moderate confidence): ${interpretations.length} items`,
      `Value judgments (lower confidence): ${values.length} items`,
    ].join("\n");

    const alternativeHypotheses = session.hypotheses
      .filter((h) => h.label !== session.user_lean_before)
      .map((h) => `"${h.label}": FOR: ${h.best_for.join(", ")}; AGAINST: ${h.best_against.join(", ")}`);

    const steelmanNote = alternativeHypotheses.length > 0
      ? "Alternative positions steelmanned:\n" + alternativeHypotheses.join("\n")
      : "No alternative hypotheses recorded. Add at least 2 more to ensure rigorous analysis.";

    return { steelmanNote, strongestObjection, factsVsInterpretation };
  }
}
