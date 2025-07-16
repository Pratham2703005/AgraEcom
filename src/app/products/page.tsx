import ProductsPageClient from "./ProductsPageClient";

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    brand?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;

  const search = resolvedSearchParams.search || "";
  const brand = resolvedSearchParams.brand || "";

  return <ProductsPageClient search={search} brand={brand} />;
}
