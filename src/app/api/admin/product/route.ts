import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pagination and search parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    console.log(`Admin products API - Page: ${page}, Skip: ${skip}, Limit: ${limit}, Search: "${search}"`);

    // Build where clause for search
    const whereClause = search.trim() ? {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive" as const
          }
        },
        {
          brand: {
            name: {
              contains: search,
              mode: "insensitive" as const
            }
          }
        }
      ]
    } : {};

    // Fetch products with pagination, search, and optimized selection
    const products = await db.product.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" }, // Use updatedAt for better performance with index
      select: {
        id: true,
        name: true,
        mrp: true,
        offers: true,
        images: true,
        weight: true,
        piecesLeft: true,
        demand: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          }
        }
      }
    });

    // Get total count for pagination info (with search filter)
    const totalProducts = await db.product.count({
      where: whereClause
    });
    const totalPages = Math.ceil(totalProducts / limit);

    console.log(`Found ${products.length} products. Total: ${totalProducts}, Total Pages: ${totalPages}`);

    // Return products with pagination metadata
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 