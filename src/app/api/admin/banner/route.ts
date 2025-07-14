import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, bannerImg, link, active } = body;
    
    if (!title || !bannerImg) {
      return NextResponse.json(
        { error: "Title and banner image are required" },
        { status: 400 }
      );
    }
    
    const banner = await db.banner.create({
      data: {
        title,
        description,
        bannerImg,
        link,
        active: active ?? true,
      },
    });
    
    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const banners = await db.banner.findMany({
      orderBy: {
        updatedAt: "desc",
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