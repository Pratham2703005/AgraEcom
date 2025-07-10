import ProductsPageClient from "./ProductsPageClient";

interface SearchParams {
  search?: string;
  sort?: string;
  brand?: string;
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const search = searchParams?.search || "";
  const brand = searchParams?.brand || "";
  
  return <ProductsPageClient search={search} brand={brand} />;
}