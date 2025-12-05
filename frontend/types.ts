export interface InfluentialSentence {
  text: string;
  impactScore: number; // 0 to 10
  reasoning?: string;
}

export interface ArticleMetadata {
  title: string;
  outlet: string;
  publishedDate: string;
  wordCount: number;
  readTime: string;
}

export interface AnalysisResult {
  metadata: ArticleMetadata;
  politicalScore: number; // -100 (Left) to 100 (Right)
  politicalLabel: string; // e.g., "Center-Right"
  leaningPercentage: number; // 0 to 100 absolute magnitude
  leaningDirection: 'Left' | 'Right' | 'Center';
  summary: string;
  topSentences: InfluentialSentence[];
  confidenceScore: number; // 0.0 to 1.0
  confidenceReasoning: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface BackendLeaning {
  predicted_class_id: number; // 0=Left, 1=Center, 2=Right
  probabilities: number[];
}

export interface BackendBiasItem {
  sentence: string;
  predicted_class_id: number;
  confidence_score: number;
}

export interface BackendBias {
  top_biased_sentences: BackendBiasItem[];
}

export interface BackendAnalysisResponse {
  leaning: BackendLeaning;
  bias: BackendBias;
}