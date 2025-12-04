import React from 'react';

interface BiasScaleProps {
  score: number; // -100 to +100
  direction: 'left' | 'right' | 'neutral';
}

const BiasScale: React.FC<BiasScaleProps> = ({ score, direction }) => {
  // Calculate position on scale (0-100%)
  const position = ((score + 100) / 200) * 100;

  const getColorClass = () => {
    if (direction === 'left') return 'bias-left';
    if (direction === 'right') return 'bias-right';
    return 'bias-neutral';
  };

  const getLabel = () => {
    const magnitude = Math.abs(score);
    if (magnitude < 10) return 'Neutral';
    if (magnitude < 25) return `Slightly ${direction}`;
    if (magnitude < 50) return `Moderately ${direction}`;
    return `Strongly ${direction}`;
  };

  return (
    <div className="bias-scale">
      <h3>Political Bias Analysis</h3>
      <div className="scale-container">
        <div className="scale-labels">
          <span className="label-left">Left</span>
          <span className="label-center">Neutral</span>
          <span className="label-right">Right</span>
        </div>
        
        <div className="scale-track">
          <div className="scale-gradient"></div>
          <div
            className={`scale-indicator ${getColorClass()}`}
            style={{ left: `${position}%` }}
          >
            <div className="indicator-dot"></div>
            <div className="indicator-label">{score}</div>
          </div>
        </div>
        
        <div className="scale-ticks">
          <span>-100</span>
          <span>-50</span>
          <span>0</span>
          <span>+50</span>
          <span>+100</span>
        </div>
      </div>
      
      <div className={`bias-result ${getColorClass()}`}>
        <strong>Result:</strong> {getLabel()}
      </div>
    </div>
  );
};

export default BiasScale;
