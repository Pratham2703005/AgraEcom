'use client';

import { useState, useRef, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";

// Define the Brand interface
interface Brand {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

// Memoize the BrandCard component to prevent unnecessary re-renders
const BrandCard = memo(({ brand }: { brand: Brand }) => (
  <Link
    href={`/products?brand=${brand.slug}`}
    className="group flex flex-col items-center justify-center w-full"
    scroll={false}
  >
    <div className="relative w-24 h-24 mb-3 rounded-full bg-white shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden">
      <Image
        width={120}
        height={120}
        src={brand.imageUrl}
        alt={brand.name}
        className="object-contain size-full"
        draggable={false}
        priority={true}
      />
    </div>
    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100 text-center leading-tight transition-colors duration-300">
      {brand.name}
    </span>
  </Link>
));

BrandCard.displayName = 'BrandCard';

// Memoize the entire BrandsSection component
export const BrandsSection = memo(function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch brands from the API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        console.log('Fetching brands...');
        const response = await fetch('/api/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        console.log('Brands fetched:', data);
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, []);
  
  // Responsive: show 2 on xs, 3 on sm, 6 on lg+
  const getBrandsToShow = () => {
    if (typeof window === "undefined") return 6;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 6;
  };

  const [brandsToShow, setBrandsToShow] = useState(getBrandsToShow());
  const [startIndex, setStartIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive update
  useEffect(() => {
    const handleResize = () => setBrandsToShow(getBrandsToShow());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Auto-advance with smooth sliding
  useEffect(() => {
    if (!brands.length || brands.length <= brandsToShow) return;
    
    // Clear any existing interval when dependencies change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setIsSliding(true);
    }, 2500);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [brandsToShow, brands.length]);
  
  // Animate row when sliding
  useEffect(() => {
    if (isSliding && rowRef.current) {
      rowRef.current.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      rowRef.current.style.transform = `translateX(-${100 / (brandsToShow + 1)}%)`;
    }
  }, [isSliding, brandsToShow]);

  // After sliding animation, update window and reset position
  const handleTransitionEnd = () => {
    if (isSliding && brands.length > 0) {
      setIsSliding(false);
      setStartIndex((prev) => (prev + 1) % brands.length);
      if (rowRef.current) {
        rowRef.current.style.transition = 'none';
        rowRef.current.style.transform = 'translateX(0)';
        // Force reflow
        void rowRef.current.offsetWidth;
        rowRef.current.style.transition = '';
      }
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
              Top Brands
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              Discover premium brands and exclusive collections
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse">Loading brands...</div>
          </div>
        </div>
      </section>
    );
  }

  // Always show the section, even if there are no brands yet
  // This ensures the section is visible while data is being loaded
  if (brands.length === 0) {
    return (
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
              Top Brands
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              Discover premium brands and exclusive collections
            </p>
          </div>
          <div className="flex justify-center">
            <p>No brands available yet.</p>
          </div>
        </div>
      </section>
    );
  }

  // Compute visible brands (N+1 for smooth slide)
  const visibleBrands = [];
  for (let i = 0; i < brandsToShow + 1; i++) {
    visibleBrands.push(brands[(startIndex + i) % brands.length]);
  }

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
            Top Brands
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg">
            Discover premium brands and exclusive collections
          </p>
        </div>
        <div className="relative">
          {/* Edge fade gradients */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 z-20 bg-gradient-to-r from-neutral-50/90 dark:from-neutral-900/90 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-20 bg-gradient-to-l from-neutral-50/90 dark:from-neutral-900/90 to-transparent" />

          {/* Brands Carousel */}
          <div className="overflow-hidden">
            <div
              ref={rowRef}
              className="flex"
              style={{ width: `${((brandsToShow + 1) * 100) / brandsToShow}%` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {visibleBrands.map((brand, idx) => (
                <div
                  key={`${brand.slug}-${startIndex}-${idx}`}
                  className="flex-shrink-0 px-3 sm:px-4 flex justify-center"
                  style={{ width: `${100 / (brandsToShow + 1)}%` }}
                >
                  <BrandCard brand={brand} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});