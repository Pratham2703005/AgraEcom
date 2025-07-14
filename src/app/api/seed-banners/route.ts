import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Delete existing banners
    await db.banner.deleteMany({});
    
    // Create sample banners
    await db.banner.createMany({
      data: [
        {
          title: "Summer Sale",
          description: "Enjoy up to 50% off on selected products",
          bannerImg: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1200&h=400&auto=format&fit=crop",
          active: true,
          link: "/products?sort=discount",
        },
        {
          title: "New Arrivals",
          description: "Check out our latest products",
          bannerImg: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1200&h=400&auto=format&fit=crop",
          active: true,
          link: "/products?sort=latest",
        },
        {
          title: "Trending Products",
          description: "Discover what's popular right now",
          bannerImg: "https://images.unsplash.com/photo-1617400877064-260698287a1c?q=80&w=1200&h=400&auto=format&fit=crop",
          active: true,
          link: "/products?sort=demand",
        },
      ],
    });
    
    return NextResponse.json({ message: "Banners seeded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error seeding banners:", error);
    return NextResponse.json(
      { error: "Failed to seed banners" },
      { status: 500 }
    );
  }
} 