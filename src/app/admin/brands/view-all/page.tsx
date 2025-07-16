"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, ArrowLeftIcon } from "lucide-react";

interface Brand {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
}

export default function ViewAllBrandsPage() {
  const { data: session, status } = useSession();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchBrands();
    }
  }, [status, session]);
  
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  
  async function fetchBrands() {
    try {
      const response = await fetch("/api/admin/brand");
      
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      
      const data = await response.json();
      setBrands(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching brands. Please try again.");
      setLoading(false);
      console.error(err);
    }
  }
  
  async function deleteBrand(id: string) {
    if (!confirm("Are you sure you want to delete this brand?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/brand/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete brand");
      }
      
      // Refresh the brands list
      fetchBrands();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error deleting brand";
      alert(errorMessage);
      console.error(err);
    }
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
        <div className="mb-6 flex">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="size-8 mr-2" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">All Brands</h1>
        </div>
          <Link 
            href="/admin/brands/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Brand
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">Loading brands...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        ) : brands.length === 0 ? (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
            No brands found. Add your first brand to get started.
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Logo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Slug
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {brands.map((brand) => (
                    <tr key={brand.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-10 w-10">
                          <Image
                            src={brand.imageUrl}
                            alt={brand.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                        {brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {brand.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Edit functionality removed as requested */}
                          <button
                            onClick={() => deleteBrand(brand.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

