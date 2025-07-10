"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Search } from "lucide-react";
import { formatProductName } from "@/lib/utils";

type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  brandId: string | null;
  brand?: Brand | null;
  weight: string | null;
  mrp: number;
  discount: number;
  price: number;
  demand: number;
  piecesLeft: number | null;
  description: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

export default function ViewAllTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState({ type: "", text: "" });

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) => 
        product.name.toLowerCase().includes(lowerCaseQuery) || 
        (product.brand && product.brand.name.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`/api/admin/product/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((product) => product.id !== id));
      setMessage({ type: "success", text: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ type: "error", text: "Failed to delete product" });
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900  shadow-sm">
      {/* Search and Message Bar */}
      <div className="p-4 border-b dark:border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">MRP</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Discount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={formatProductName(product)}
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
                        <span className="text-neutral-400 dark:text-neutral-500">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                    {formatProductName(product)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    ₹{product.mrp.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {product.discount}%
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                  ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                    {product.piecesLeft !== null ? product.piecesLeft : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting[product.id]}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No products found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}