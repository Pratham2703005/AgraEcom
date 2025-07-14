import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    // Sort options
    let orderBy: Record<string, unknown> = {};
    switch (sort) {
      case "discount":
        orderBy = { discount: "desc" };
        break;
      case "demand":
        orderBy = { demand: "desc" };
        break;
      case "latest":
      default:
        orderBy = { updatedAt: "desc" };
        break;
    }

    // Fetch products with brand relation
    const products = await db.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        brand: true
      }
    });

    // Get total count for pagination
    const totalProducts = await db.product.count({ where });
    const totalPages = Math.ceil(totalProducts / pageSize);

    console.log(`Found ${products.length} products for page ${page}. Total: ${totalProducts}, Total Pages: ${totalPages}`);

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        totalProducts,
        totalPages,
        hasMore: page < totalPages,
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