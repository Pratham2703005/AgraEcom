import React from 'react';

interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: { container: 'w-20 h-20', text: 'text-base' },
    md: { container: 'w-28 h-28', text: 'text-lg' },
    lg: { container: 'w-36 h-36', text: 'text-xl' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${currentSize.container}`}>
        {/* Simple rotating border */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
        
        {/* Main Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className={`font-bold text-gray-800 dark:text-gray-200 ${currentSize.text} tracking-wide`}>
            Agra
          </div>
          <div className={`font-bold text-blue-600 dark:text-blue-400 ${currentSize.text} tracking-wide -mt-1`}>
            Ecom
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default CustomLoader;