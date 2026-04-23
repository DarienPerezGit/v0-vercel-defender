"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  isScanning: boolean;
}

export function ScoreGauge({ score, isScanning }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    if (isScanning) {
      setAnimatedScore(0);
      return;
    }
    
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [score, isScanning]);
  
  const getColor = (s: number) => {
    if (s < 40) return "#ef4444"; // red
    if (s <= 70) return "#f97316"; // orange
    return "#22c55e"; // green
  };
  
  const color = getColor(animatedScore);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={isScanning ? circumference : strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isScanning ? (
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span 
                className="text-6xl font-mono font-bold transition-colors duration-300"
                style={{ color }}
              >
                {animatedScore}
              </span>
            </>
          )}
        </div>
      </div>
      <span className="mt-4 text-lg text-muted-foreground font-medium">Security Score</span>
    </div>
  );
}
