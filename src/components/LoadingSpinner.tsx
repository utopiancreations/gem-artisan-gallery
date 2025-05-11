// src/components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = 'jewelry-light',
  text = 'Loading...' 
}) => {
  // Map size to actual dimensions
  const sizeMap = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };
  
  const textSizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className={`animate-pulse ${sizeMap[size]} bg-${color} rounded-full`}></div>
      {text && <p className={`mt-3 text-jewelry-gray ${textSizeMap[size]}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;


