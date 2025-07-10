import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import ViewAllProductsTable from "./view-all-table";
import { ArrowLeftIcon } from "lucide-react";

export default async function ViewAllProductsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams?.page) || 1;
  const pageSize = 20;
  const skip = (page - 1) * pageSize;
  const products = await db.product.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true
    }
  });
  const total = await db.product.count();
  const totalPages = Math.ceil(total / pageSize);
 
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center">
        <Link href="/admin" className="px-4 py-2 rounded-lg text-neutral-700 dark:text-neutral-100 mb-6">
          <ArrowLeftIcon className="w-8 h-8" />
        </Link>
        <h1 className="text-3xl font-bold mb-6">All Products</h1>
      </div>
      
      <div className="bg-white shadow-sm overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600"></div>
              <span className="ml-2 text-neutral-600">Loading...</span>
            </div>
          }>
            <ViewAllProductsTable products={products} />
          </Suspense>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-neutral-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-3">
            {page > 1 && (
              <Link 
                href={`/admin/products/view-all?page=${page - 1}`} 
                className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 text-neutral-700"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link 
                href={`/admin/products/view-all?page=${page + 1}`} 
                className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg hover:bg-neutral-200 text-neutral-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    
  );
}