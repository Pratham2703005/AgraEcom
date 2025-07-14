import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      where: {
        active: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ banners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
} 