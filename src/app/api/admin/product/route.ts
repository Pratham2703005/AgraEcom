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

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    console.log(`Admin products API - Page: ${page}, Skip: ${skip}, Limit: ${limit}`);

    // Fetch products with pagination
    const products = await db.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        brand: true
      }
    });

    // Get total count for pagination info
    const totalProducts = await db.product.count();
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