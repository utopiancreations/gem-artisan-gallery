// src/components/LoadingSection.tsx
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingSectionProps {
  height?: string;
  text?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
}

const LoadingSection: React.FC<LoadingSectionProps> = ({ 
  height = 'h-64', 
  text = 'Loading content...',
  spinnerSize = 'medium'
}) => {
  return (
    <div className={`${height} w-full flex items-center justify-center`}>
      <LoadingSpinner size={spinnerSize} text={text} />
    </div>
  );
};

export default LoadingSection;
