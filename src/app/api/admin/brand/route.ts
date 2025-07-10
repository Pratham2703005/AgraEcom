import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/brand - Get all brands
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const brands = await db.brand.findMany({
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

// POST /api/admin/brand - Create a new brand
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { name, slug, imageUrl } = await request.json();
    
    if (!name || !slug || !imageUrl) {
      return NextResponse.json(
        { error: "Name, slug, and image URL are required" },
        { status: 400 }
      );
    }
    
    // Check if brand with same slug already exists
    const existingBrand = await db.brand.findUnique({
      where: { slug }
    });
    
    if (existingBrand) {
      return NextResponse.json(
        { error: "A brand with this slug already exists" },
        { status: 400 }
      );
    }
    
    const brand = await db.brand.create({
      data: {
        name,
        slug,
        imageUrl,
      },
    });
    
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
} 