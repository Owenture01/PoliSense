import React from 'react';

interface BiasSummaryProps {
  summary: string;
  direction: 'left' | 'right' | 'neutral';
}

const BiasSummary: React.FC<BiasSummaryProps> = ({ summary, direction }) => {
  const getIconColor = () => {
    if (direction === 'left') return '#3b82f6';
    if (direction === 'right') return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="bias-summary">
      <div className="summary-header">
        <svg
          className="summary-icon"
          fill="none"
          stroke={getIconColor()}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3>Bias Analysis Summary</h3>
      </div>
      <div className="summary-content">
        <p>{summary}</p>
      </div>
      <div className="summary-note">
        <strong>Note:</strong> This analysis uses keyword-based detection as a demonstration. 
        In a production system, this would be powered by advanced AI models for more accurate bias detection.
      </div>
    </div>
  );
};

export default BiasSummary;
