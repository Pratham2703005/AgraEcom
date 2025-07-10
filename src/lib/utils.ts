import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define Product type for the formatting function
type ProductWithBrandAndWeight = {
  name: string;
  brand?: string | { name: string } | null;
  weight?: string | null;
};

// Format product name: brand + name + weight
export function formatProductName(product: ProductWithBrandAndWeight): string {
  const parts = [];
  
  // Handle brand which can be a string or an object with a name property
  if (product.brand) {
    if (typeof product.brand === 'string') {
      parts.push(product.brand);
    } else if (typeof product.brand === 'object' && product.brand.name) {
      parts.push(product.brand.name);
    }
  }
  
  parts.push(product.name);
  if (product.weight) parts.push(`- ${product.weight}`);
  return parts.join(" ");
} 