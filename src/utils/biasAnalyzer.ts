import * as pdfjsLib from 'pdfjs-dist';
import type { BiasAnalysis, BiasedSentence } from '../types';

// Set up PDF.js worker - use local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

// Constants
const MIN_SENTENCE_LENGTH = 20;

interface TextItem {
  str: string;
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item as TextItem).str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

/**
 * Analyze text for political bias (Mock implementation)
 * In a real application, this would call an AI/ML backend service
 */
export function analyzeBias(text: string): BiasAnalysis {
  const sentences = splitIntoSentences(text);
  
  // Mock bias detection - looks for politically charged keywords
  const leftKeywords = ['progressive', 'liberal', 'democrat', 'climate change', 'equality', 'diversity', 'regulation', 'welfare'];
  const rightKeywords = ['conservative', 'republican', 'traditional', 'free market', 'deregulation', 'tax cuts', 'border security'];
  
  // Analyze each sentence
  const sentenceScores: BiasedSentence[] = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Count keyword matches
    leftKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score -= 20;
    });
    
    rightKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) score += 20;
    });
    
    return {
      text: sentence,
      biasScore: Math.max(-100, Math.min(100, score)),
    };
  });
  
  // Get top 5 most biased sentences (by absolute value)
  const topSentences = sentenceScores
    .filter(s => s.biasScore !== 0)
    .sort((a, b) => Math.abs(b.biasScore) - Math.abs(a.biasScore))
    .slice(0, 5);
  
  // Calculate overall bias
  const totalScore = sentenceScores.reduce((sum, s) => sum + s.biasScore, 0);
  const overallBiasScore = sentenceScores.length > 0 
    ? Math.round(totalScore / sentenceScores.length) 
    : 0;
  
  // Determine direction
  let biasDirection: 'left' | 'right' | 'neutral';
  if (overallBiasScore < -10) biasDirection = 'left';
  else if (overallBiasScore > 10) biasDirection = 'right';
  else biasDirection = 'neutral';
  
  // Generate summary
  const summary = generateBiasSummary(overallBiasScore, biasDirection, topSentences);
  
  return {
    overallBiasScore,
    biasDirection,
    topSentences,
    summary,
  };
}

/**
 * Split text into sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > MIN_SENTENCE_LENGTH); // Filter out very short fragments
}

/**
 * Generate a summary of bias
 */
function generateBiasSummary(
  score: number,
  direction: 'left' | 'right' | 'neutral',
  topSentences: BiasedSentence[]
): string {
  if (direction === 'neutral') {
    return 'This text appears to be relatively neutral, with no strong political bias detected. The language used is balanced and doesn\'t strongly favor either political perspective.';
  }
  
  const magnitude = Math.abs(score);
  const intensity = magnitude > 50 ? 'strongly' : magnitude > 25 ? 'moderately' : 'slightly';
  
  let summary = `This text shows a ${intensity} ${direction}-leaning bias (score: ${score}). `;
  
  if (topSentences.length > 0) {
    summary += `The analysis identified ${topSentences.length} sentence${topSentences.length > 1 ? 's' : ''} with notable political framing. `;
    
    if (direction === 'left') {
      summary += 'The text uses language and framing commonly associated with progressive or liberal perspectives, emphasizing themes such as social equality, environmental protection, or government intervention.';
    } else {
      summary += 'The text uses language and framing commonly associated with conservative perspectives, emphasizing themes such as traditional values, free markets, or limited government.';
    }
  }
  
  return summary;
}
