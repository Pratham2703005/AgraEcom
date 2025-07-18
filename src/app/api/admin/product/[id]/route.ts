import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Product schema for validation
const productUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  mrp: z.coerce.number().min(0, "MRP must be a positive number").optional(),
  offers: z.record(z.string(), z.coerce.number()).optional(),
  images: z.array(z.string()).min(1, "At least one image is required").optional(),
  brandId: z.string().min(1, "Brand is required").optional(),
  weight: z.string().optional(),
  demand: z.coerce.number().min(0).max(1).optional(),
  piecesLeft: z.coerce.number().min(0).optional(),
  description: z.string().optional()
});
 
// GET a single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: (await params).id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT to update a product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validatedData = productUpdateSchema.parse(body);
    
    // If brandId is provided, check if the brand exists
    if (validatedData.brandId) {
      const brandExists = await db.brand.findUnique({
        where: { id: validatedData.brandId }
      });
      
      if (!brandExists) {
        return NextResponse.json({ error: "Brand not found" }, { status: 400 });
      }
    }
    
    // Update the product
    const product = await db.product.update({
      where: { id: (await params).id },
      data: validatedData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH to update specific fields (like stock)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const updateData: Record<string, number | Record<string, number>> = {};
    
    if (Object.prototype.hasOwnProperty.call(body, 'piecesLeft')) {
      updateData.piecesLeft = body.piecesLeft;
    }
    
    if (Object.prototype.hasOwnProperty.call(body, 'offers')) {
      updateData.offers = body.offers;
    }
    
    if (Object.keys(updateData).length > 0) {
      
      const product = await db.product.update({
        where: { id: (await params).id },
        data: updateData,
      });

      return NextResponse.json(product);
    } else {
      return NextResponse.json(
        { error: "Invalid update request" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Update operation failed" },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await db.product.delete({
      where: { id: (await params).id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}