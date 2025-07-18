import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mrp: z.coerce.number().min(0, "MRP must be a positive number"),
  offers: z.record(z.string(), z.coerce.number()).default({"1": 0}),
  images: z.array(z.string()).min(1, "At least one image is required"),
  brandId: z.string().min(1, "Brand is required"),
  weight: z.string().optional(),
  demand: z.coerce.number().min(0).max(1).optional().default(0),
  piecesLeft: z.coerce.number().min(0).optional().default(0),
  description: z.string().optional().default("")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Parse and validate the request body
    const validatedData = productSchema.parse(body);
    
    // Check if the brand exists
    const brandExists = await db.brand.findUnique({
      where: { id: validatedData.brandId }
    });
    
    if (!brandExists) {
      return NextResponse.json({ message: "Brand not found" }, { status: 400 });
    }
    
    // Check if a product with the same name, brandId, and weight already exists
    const productAlreadyExists = await db.product.findFirst({
      where: {
        name: validatedData.name,
        brandId: validatedData.brandId,
        weight: validatedData.weight || null,
      },
    });
    
    if (productAlreadyExists) {
      return NextResponse.json({ message: "Product already exists." }, { status: 400 });
    }

    // Create the product
    const product = await db.product.create({
      data: validatedData
    });

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      message: "Failed to create product", 
      error: (error as Error).message 
    }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
} 