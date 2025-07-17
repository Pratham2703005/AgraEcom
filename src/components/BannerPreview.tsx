"use client";

import Image from 'next/image';

interface BannerPreviewProps {
  title: string;
  description: string | null;
  bannerImg: string;
  link: string | null;
  isMobile?: boolean;
}

export default function BannerPreview({ 
  title, 
  description, 
  bannerImg, 
  link,
  isMobile = false
}: BannerPreviewProps) {
  return (
    <div className="w-full mb-4">
      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
        Preview (how it will appear on the products page)
      </h3>
      
      <div className={`relative w-full ${isMobile ? 'h-40' : 'h-56'} rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
        {bannerImg ? (
          <div className="w-full h-full relative">
            <div className="w-full h-full">
              <Image 
                src={bannerImg} 
                alt={title || "Banner preview"} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
              {title && (
                <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-md">{title}</h2>
              )}
              {description && (
                <p className="text-xs md:text-base opacity-90 drop-shadow-md">{description}</p>
              )}
            </div>
            
            {link && (
              <div className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded">
                Has link: {link.substring(0, 20)}{link.length > 20 ? '...' : ''}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Upload an image to preview banner</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex justify-between">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          {bannerImg ? 'Image loaded' : 'No image'}
        </div>
        <button 
          onClick={() => {
            const previewEl = document.getElementById('banner-preview-mobile');
            if (previewEl) {
              previewEl.classList.toggle('hidden');
            }
          }}
          className="text-xs text-blue-500 hover:underline"
        >
          Toggle mobile preview
        </button>
      </div>
      
      {/* Mobile Preview (hidden by default) */}
      <div id="banner-preview-mobile" className="hidden mt-4">
        <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
          Mobile Preview
        </h3>
        <div className="w-full max-w-[320px] mx-auto border border-neutral-300 dark:border-neutral-700 rounded-lg p-2 bg-white dark:bg-neutral-900">
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {bannerImg ? (
              <div className="w-full h-full relative">
                <div className="w-full h-full">
                  <Image 
                    src={bannerImg} 
                    alt={title || "Banner preview"} 
                    fill
                    sizes="100vw"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                  {title && (
                    <h2 className="text-base font-bold mb-0.5 drop-shadow-md">{title}</h2>
                  )}
                  {description && (
                    <p className="text-xs opacity-90 drop-shadow-md line-clamp-2">{description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">No image</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}