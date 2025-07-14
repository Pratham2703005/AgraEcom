"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  bannerImg: string;
  active: boolean;
  link: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeleteBannerPageProps {
  params: {
    id: string;
  };
}

export default function DeleteBannerPage({ params }: DeleteBannerPageProps) {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/admin/banner/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch banner");
        }
        
        const data = await response.json();
        setBanner(data.banner);
      } catch (err) {
        console.error("Error fetching banner:", err);
        setError("Failed to load banner data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBanner();
  }, [params.id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    
    try {
      const response = await fetch(`/api/admin/banner/${params.id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete banner");
      }
      
      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!banner && !isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Banner Not Found</h1>
          <p className="mb-6">The banner you are trying to delete could not be found.</p>
          <Link
            href="/admin/banners"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Banners
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          href="/admin/banners" 
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Banners
        </Link>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">Delete Banner</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-lg mb-4">Are you sure you want to delete this banner?</p>
          
          <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <div className="w-24 h-16 mr-4 overflow-hidden rounded">
                <img 
                  src={banner?.bannerImg} 
                  alt={banner?.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{banner?.title}</h3>
                {banner?.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                    {banner.description}
                  </p>
                )}
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  Status: {banner?.active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-neutral-600 dark:text-neutral-400 mb-6">
            <p className="text-sm">This action cannot be undone. The banner will be permanently deleted.</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              isDeleting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Deleting..." : "Delete Banner"}
          </button>
          <Link
            href="/admin/banners"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
} 