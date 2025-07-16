"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import './BannerSlider.css'

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Custom styles for Swiper

type Banner = {
  id: string;
  title: string;
  description: string | null;
  bannerImg: string;
  active: boolean;
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const BannerSkeleton = () => (
  <div className="relative w-full h-64 md:h-80 bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden animate-pulse">
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
      <div className="h-6 bg-neutral-300 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2"></div>
    </div>
  </div>
);

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }
        const data = await response.json();
        setBanners(data.banners);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setError("Failed to load banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) {
    return <BannerSkeleton />;
  }

  if (error || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full mb-8 banner-slider-container">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ 
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active',
          bulletClass: 'swiper-pagination-bullet',
        }}
        autoplay={{
          delay: isMobile ? 7000 : 5000,
          disableOnInteraction: false,
        }}
        className={`w-full ${isMobile ? 'h-40' : 'h-56 md:h-72'} rounded-lg banner-swiper`}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} className="bg-neutral-100 dark:bg-neutral-800">
            {banner.link ? (
              <Link href={banner.link} className="block w-full h-full relative">
                  <Image 
                    src={banner.bannerImg} 
                    alt={banner.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-md">{banner.title}</h2>
                  {banner.description && (
                    <p className="text-xs md:text-base opacity-90 drop-shadow-md">{banner.description}</p>
                  )}
                </div>
              </Link>
            ) : (
              <div className="w-full h-full relative">
                  <Image 
                    src={banner.bannerImg} 
                    alt={banner.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-md">{banner.title}</h2>
                  {banner.description && (
                    <p className="text-xs md:text-base opacity-90 drop-shadow-md">{banner.description}</p>
                  )}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}