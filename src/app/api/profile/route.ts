import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { message: "Invalid session data" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Get user profile data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        deliveryAddress: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Return the user data
    return NextResponse.json(
      { 
        message: "Profile fetched successfully", 
        user
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validate the request body
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, address, deliveryAddress, image } = result.data;
    const userId = session.user.id;

    // Create update data object with only defined fields
    const updateData: Partial<{
      name?: string;
      phone?: string | null;
      address?: string | null;
      deliveryAddress?: string | null;
      image?: string | null;
    }> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (image !== undefined) updateData.image = image;

    // Update the user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, 
        name: true, 
        email: true, 
        image: true, 
        phone: true, 
        phoneVerified: true,
        address: true, 
        deliveryAddress: true,
        role: true
      }
    });

    // Return the updated user data
    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        user: updatedUser 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
} 