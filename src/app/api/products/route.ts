import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "latest";
    const brand = searchParams.get("brand") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 16; // Keep consistent page size for infinite scrolling
    const skip = (page - 1) * pageSize;

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
    
    // Handle search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { 
          brand: {
            name: { contains: search, mode: "insensitive" }
          }
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