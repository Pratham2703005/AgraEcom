import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/brands - Get all brands for public display
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
} 