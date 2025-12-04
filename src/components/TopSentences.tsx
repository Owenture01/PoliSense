import React from 'react';
import type { BiasedSentence } from '../types';

interface TopSentencesProps {
  sentences: BiasedSentence[];
}

const TopSentences: React.FC<TopSentencesProps> = ({ sentences }) => {
  if (sentences.length === 0) {
    return (
      <div className="top-sentences">
        <h3>Top Biased Sentences</h3>
        <p className="no-data">No biased sentences detected</p>
      </div>
    );
  }

  const getBiasClass = (score: number) => {
    if (score < 0) return 'sentence-left';
    if (score > 0) return 'sentence-right';
    return 'sentence-neutral';
  };

  const getBiasLabel = (score: number) => {
    if (score < 0) return 'Left-leaning';
    if (score > 0) return 'Right-leaning';
    return 'Neutral';
  };

  return (
    <div className="top-sentences">
      <h3>Top 5 Most Biased Sentences</h3>
      <div className="sentences-list">
        {sentences.map((sentence, index) => (
          <div key={index} className={`sentence-card ${getBiasClass(sentence.biasScore)}`}>
            <div className="sentence-header">
              <span className="sentence-rank">#{index + 1}</span>
              <span className="sentence-score">
                {getBiasLabel(sentence.biasScore)} ({sentence.biasScore > 0 ? '+' : ''}{sentence.biasScore})
              </span>
            </div>
            <p className="sentence-text">{sentence.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSentences;
