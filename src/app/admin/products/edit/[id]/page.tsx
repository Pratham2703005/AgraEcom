import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-product-form";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

type PageProps = Promise<{id: string}>

export default async function EditProductPage(props : {params : PageProps}) {
  const { id } = await props.params;
  const product = await db.product.findUnique({ 
    where: { id: id },
    include: {
      brand: true
    }
  });
  
  if (!product) return notFound();
  
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/products/view-all"
            className="p-2 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div> 
      </div>
      <EditProductForm product={product} />
    </div>
  );
} 