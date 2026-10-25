export interface CandidateComparison {
  candidateId: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  policyNotes?: string | null;
}

export interface ResearchSummary {
  summaryMarkdown: string;
  recommendedCandidateId: string | null;
  recommendationReason: string | null;
  comparisons: CandidateComparison[];
  generatedAt: Date;
}
