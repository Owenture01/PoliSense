export interface BiasAnalysis {
  overallBiasScore: number; // -100 (left) to +100 (right)
  biasDirection: 'left' | 'right' | 'neutral';
  topSentences: BiasedSentence[];
  summary: string;
}

export interface BiasedSentence {
  text: string;
  biasScore: number;
  explanation?: string;
}

export interface AnalyzedDocument {
  id: string;
  fileName: string;
  uploadDate: Date;
  analysis: BiasAnalysis;
  fullText: string;
}
