import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Type guard to check if offers is a valid Record<string, number>
function isValidOffers(offers: Prisma.JsonValue | null): offers is Record<string, number> {
  return (
    offers !== null &&
    typeof offers === 'object' &&
    !Array.isArray(offers) &&
    Object.values(offers).every(value => typeof value === 'number')
  );
}

// Helper function to extract discount from offers
function getBaseDiscount(offers: Prisma.JsonValue | null): number {
  if (!offers) return 0;
  
  if (isValidOffers(offers)) {
    return offers["1"] || 0;
  }
  
  if (typeof offers === 'string') {
    try {
      const parsed = JSON.parse(offers);
      if (isValidOffers(parsed)) {
        return parsed["1"] || 0;
      }
    } catch {
      return 0;
    }
  }
  
  return 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "latest";
    const brand = searchParams.get("brand") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 12; // Reduced page size for better testing
    const skip = (page - 1) * pageSize;

    console.log(`Fetching products - Page: ${page}, Skip: ${skip}, PageSize: ${pageSize}`);
    console.log(`Filters - Search: "${search}", Sort: ${sort}, Brand: "${brand}"`);

    // Build the query
    const where: Record<string, unknown> = {};
    
    // Handle brand filter
    if (brand) {
      where.brand = {
        name: {
          equals: brand,
          mode: "insensitive"
        }
      };
    }
    
    // Handle search with improved matching logic
    if (search) {
      // Split search into words for better partial matching
      const searchWords = search.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      
      where.OR = [
        // Match against full search string
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { 
          brand: {
            name: { contains: search, mode: "insensitive" }
          }
        },
        
        // Match if product contains all words in the search (in any order)
        {
          AND: searchWords.map(word => ({
            OR: [
              { name: { contains: word, mode: "insensitive" } },
              { description: { contains: word, mode: "insensitive" } }
            ]
          }))
        },
        
        // Match if product name + brand name contains all search words
        {
          brand: {
            name: {
              contains: searchWords[0],
              mode: "insensitive"
            }
          },
          name: searchWords.length > 1 ? {
            contains: searchWords.slice(1).join(" "),
            mode: "insensitive"
          } : undefined
        }
      ];
    }

    // Define a type for our products
    type ProductWithBrand = {
      id: string;
      name: string;
      mrp: number;
      offers: Prisma.JsonValue;
      images: string[];
      brand?: { id: string; name: string; slug: string; imageUrl: string } | null;
      weight?: string | null;
      piecesLeft?: number | null;
      description?: string | null;
      createdAt: Date;
      updatedAt: Date;
      brandId?: string | null;
      demand: number;
    };

    // Fetch all products matching the filters (without pagination)
    // but only if we're sorting by discount/best-deals
    let products: ProductWithBrand[] = [];
    
    if (sort === "discount" || sort === "best-deals") {
      // Fetch all products matching the filters
      const allMatchingProducts = await db.product.findMany({
        where,
        select: {
          id: true,
          offers: true
        }
      });
      
      // Sort by discount
      const sortedIds = allMatchingProducts
        .sort((a, b) => {
          const aDiscount = getBaseDiscount(a.offers);
          const bDiscount = getBaseDiscount(b.offers);
          return bDiscount - aDiscount;
        })
        .map(p => p.id);
      
      // Apply pagination to the sorted IDs
      const paginatedIds = sortedIds.slice(skip, skip + pageSize);
      
      // Fetch the complete product data for the paginated IDs
      products = await db.product.findMany({
        where: {
          id: {
            in: paginatedIds
          }
        },
        include: {
          brand: true
        },
        orderBy: {
          id: "asc" // Just to have a consistent order
        }
      });
      
      // Restore the correct order from our sorted IDs
      products = paginatedIds.map(id => {
        const product = products.find(p => p.id === id);
        if (!product) {
          throw new Error(`Product with ID ${id} not found in fetched products`);
        }
        return product;
      });
    } else {
      // For other sort options, use standard Prisma query with pagination
      let orderBy: Record<string, unknown>[] = [];
      
      switch (sort) {
        case "trending":
        case "demand":
          orderBy = [
            { demand: "desc" },
            { createdAt: "desc" },
            { id: "asc" }
          ];
          break;
        case "latest":
        default:
          orderBy = [
            { createdAt: "desc" },
            { id: "asc" }
          ];
          break;
      }
      
      products = await db.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          brand: true
        }
      });
    }

    // Get total count for pagination
    const totalProducts = await db.product.count({ where });
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Fix hasMore calculation
    const hasMore = skip + products.length < totalProducts;

    console.log(`Found ${products.length} products for page ${page}. Total: ${totalProducts}, Total Pages: ${totalPages}`);

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        totalProducts,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 