import { db } from "@/lib/db";
import StockManagementClient from "./stock-management-client";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default async function StockManagementPage() {
  // Fetch all products with minimal data needed for stock management
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      mrp: true,
      offers: true,
      images: true,
      weight: true,
      piecesLeft: true,
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        }
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Stock Management</h1>
        </div>
        
        {/* Client Component */}
        <StockManagementClient initialProducts={products} />
      </div>
    </div>
  );
} 