import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Build role filter
    const roleFilter = role && ["ADMIN", "CUSTOMER"].includes(role.toUpperCase())
      ? { role: role.toUpperCase() as "ADMIN" | "CUSTOMER" }
      : {};

    // Combine filters
    const whereClause = {
      ...searchFilter,
      ...roleFilter,
    };

    // Get total count
    const totalUsers = await db.user.count({
      where: whereClause,
    });

    // Get users with pagination and sorting
    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    // Get role counts
    const roleCounts = await db.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    const roleStats = {
      ADMIN: roleCounts.find((r) => r.role === "ADMIN")?._count.role || 0,
      CUSTOMER: roleCounts.find((r) => r.role === "CUSTOMER")?._count.role || 0,
    };

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1,
      },
      roleStats,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}