'use client';

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { useOffline, safeFetch } from "@/lib/useOffline";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

// Define the Brand interface
interface Brand {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

// Brand skeleton component for loading state
const BrandSkeleton = () => (
  <div className="flex flex-col items-center justify-center w-full animate-pulse">
    <div className="w-24 h-24 mb-3 rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
    <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
  </div>
);

// Memoize the BrandCard component to prevent unnecessary re-renders
const BrandCard = memo(({ brand }: { brand: Brand }) => (
  <Link
    href={`/products?brand=${encodeURIComponent(brand.name)}`}
    className="group flex flex-col items-center justify-center w-full"
    scroll={false}
  >
    <div className="relative w-24 h-24 mb-3 rounded-full bg-white shadow-sm border border-neutral-100 group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden">
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
    <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 dark:text-neutral-300 dark:group-hover:text-neutral-100 text-center leading-tight transition-colors duration-300">
      {brand.name}
    </span>
  </Link>
));

BrandCard.displayName = 'BrandCard';

// Memoize the entire BrandsSection component
export const BrandsSection = memo(function BrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const isOffline = useOffline();
  
  // Fetch brands from the API
  useEffect(() => {
    const fetchBrands = async () => {
      if (isOffline) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching brands...');
        const response = await safeFetch('/api/brands');
        if (!response || !response.ok) {
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
  }, [isOffline]);
  
  // If loading, show skeleton loading state
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <BrandSkeleton key={`brand-skeleton-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Always show the section, even if there are no brands yet
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

          {/* Brands Carousel using Swiper */}
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={24}
            slidesPerView={2}
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            freeMode={true}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 32,
              },
              1024: {
                slidesPerView: 6,
                spaceBetween: 32,
              },
            }}
            className="brands-swiper"
          >
            {brands.map((brand) => (
              <SwiperSlide key={brand.id} className="!h-auto">
                <div className="flex justify-center px-3 sm:px-4">
                  <BrandCard brand={brand} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
});

