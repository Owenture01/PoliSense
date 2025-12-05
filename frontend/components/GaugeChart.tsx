import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  score: number; // -100 to 100
  label: string;
  percentage: number;
  direction: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ score, label, percentage, direction }) => {
  // Normalize score (-100 to 100) to angle (180 to 0)
  // -100 (Left) = 180 deg
  // 0 (Center) = 90 deg
  // 100 (Right) = 0 deg
  
  // Map input score to 0-100 range for the gauge needle position
  const normalizedScore = (score + 100) / 2; // 0 to 100
  
  // Data for the background arc (Left Blue -> Right Red)
  // We simulate a gradient by using multiple cells if needed, but SVG gradient is better.
  // Here we will use a single slice with a gradient fill.
  const data = [{ name: 'Range', value: 100 }];
  
  const needleRotation = 180 - (normalizedScore / 100) * 180;

  return (
    <div className="relative w-full h-64 flex flex-col items-center justify-center">
      <h3 className="text-gray-500 text-sm font-semibold mb-2 absolute top-2 left-10">Left</h3>
      <h3 className="text-gray-500 text-sm font-semibold mb-2 absolute top-2 right-10">Right</h3>
      <h3 className="text-gray-400 text-xs font-medium mb-2 absolute top-2 left-1/2 transform -translate-x-1/2">Center</h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="biasGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
              <stop offset="50%" stopColor="#e5e7eb" /> {/* Gray/White */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red */}
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            fill="url(#biasGradient)"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill="url(#biasGradient)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Needle */}
      <div
        className="absolute bottom-[30%] left-[calc(50%-4px)] w-2 h-[100px] origin-bottom transition-transform duration-1000 ease-out"
        style={{ transform: `rotate(${needleRotation - 90}deg)` }} // -90 adjustment because default vertical is 0deg usually? CSS rotate starts from 12 oclock? No, usually standard.
        // Actually CSS rotate: 0 is usually pointing UP. 
        // We want 180deg (Left) to be pointing Left (-90deg CSS).
        // Let's refine the transform logic below purely with CSS styles.
      >
         {/* Using an SVG for a nice needle look */}
         <svg width="100%" height="100%" viewBox="0 0 20 100" preserveAspectRatio="none">
           <path d="M10 0 L20 100 L10 90 L0 100 Z" fill="#374151" />
           <circle cx="10" cy="90" r="5" fill="#374151" />
         </svg>
      </div>
      
      {/* Needle Overlay Logic specific to React/CSS rotation */}
       <div 
        className="absolute w-full h-full pointer-events-none flex justify-center items-end pb-[30%]"
      >
         {/* This container sits on top. We can rotate an inner element. */}
         <div 
            className="w-1 h-32 bg-slate-700 origin-bottom rounded-full transition-all duration-1000"
            style={{ 
                transform: `rotate(${ (normalizedScore * 1.8) - 90 }deg)` // 0 score -> -90deg (Left), 50 score -> 0deg (Up), 100 score -> 90deg (Right)
            }}
         ></div>
         {/* Center pivot */}
         <div className="absolute w-4 h-4 bg-slate-800 rounded-full bottom-[29%]"></div>
      </div>

      <div className="absolute bottom-0 text-center">
        <h2 className="text-xl font-bold text-gray-800">Tier: {label}</h2>
        <p className="text-lg text-gray-600 mt-1">
          {percentage}% {direction}-Leaning
        </p>
      </div>
    </div>
  );
};

export default GaugeChart;
