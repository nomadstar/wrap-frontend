import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  className = "min-h-screen" 
}) => {
  return (
    <div className={`${className} bg-gray-50 flex items-center justify-center`}>
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
