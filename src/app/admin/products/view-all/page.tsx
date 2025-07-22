import Link from "next/link";
import ViewAllProductsTable from "./view-all-table";
import { ArrowLeftIcon } from "lucide-react";
import { Product } from "@prisma/client";
import ErrorBoundary from "@/components/ui/error-boundary";

export default async function ViewAllProductsPage() {
  // We'll let the client component handle all data fetching
  // This provides better UX with the skeleton loading
  const initialProducts: Product[] = [];
 
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center">
        <Link href="/admin" className="px-2 sm:px-4 py-2 rounded-lg text-neutral-700 dark:text-neutral-100 mb-6">
          <ArrowLeftIcon className="size-6" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">All Products</h1>
      </div>
      
      <div className="bg-white shadow-sm overflow-hidden">
        <ErrorBoundary>
          <ViewAllProductsTable products={initialProducts} />
        </ErrorBoundary>
      </div>
    </div>
  );
}