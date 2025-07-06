import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  className = "min-h-screen" 
}) => {
  return (
    <div className={`${className} bg-gray-50 flex items-center justify-center p-4`}>
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Data</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <span>🔄</span>
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
