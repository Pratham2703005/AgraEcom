import ProductsPageClient from "./ProductsPageClient";

interface SearchParams {
  search?: string;
  sort?: string;
  brand?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const search = (await searchParams)?.search || "";
  const brand = (await searchParams)?.brand || "";
  
  return <ProductsPageClient search={search} brand={brand} />;
}