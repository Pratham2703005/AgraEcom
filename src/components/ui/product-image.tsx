"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = "",
  loading = "lazy",
  priority = false,
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (imageError) {
    return (
      <div className={`bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}>
        <div className="text-center p-2">
          <svg className="w-6 h-6 mx-auto text-neutral-400 dark:text-neutral-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${fill ? '' : 'inline-block'}`}>
      {isLoading && (
        <div className={`bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse ${fill ? 'absolute inset-0' : ''} ${className}`}>
          <div className="flex items-center justify-center h-full">
            <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading={loading}
        priority={priority}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}