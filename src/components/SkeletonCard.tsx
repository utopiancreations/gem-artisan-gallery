// src/components/SkeletonCard.tsx
// Use this for gallery/artwork items that are loading
import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200"></div>
      
      {/* Content placeholders */}
      <div className="p-4 space-y-3">
        {/* Category placeholder */}
        <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
        
        {/* Title placeholder */}
        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
        
        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;