import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatProductName } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    
    // If query is empty or too short, return empty suggestions
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Split query into words for better partial matching
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    // Get product name suggestions
    const productSuggestions = await db.product.findMany({
      where: {
        OR: [
          // Match against full query string
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          
          // Match if product contains all words in the query (in any order)
          {
            AND: queryWords.map(word => ({
              OR: [
                { name: { contains: word, mode: "insensitive" } },
                { description: { contains: word, mode: "insensitive" } }
              ]
            }))
          },
          
          // Match if product name + brand name contains all query words
          {
            brand: {
              name: {
                contains: queryWords[0],
                mode: "insensitive"
              }
            },
            name: queryWords.length > 1 ? {
              contains: queryWords.slice(1).join(" "),
              mode: "insensitive"
            } : undefined
          }
        ],
      },
      select: {
        id: true,
        name: true,
        brand: true,
        weight: true,
        brandId: true,
      },
      take: 5, // Limit to 5 product suggestions
      orderBy: {
        demand: 'desc', // Show most popular products first
      },
    });

    // Get brand suggestions from the Brand model
    const brandModelSuggestions = await db.brand.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 3, // Limit to 3 brand suggestions
    });

    // Format suggestions
    const suggestions = [
      // Product suggestions
      ...productSuggestions.map(product => ({
        type: 'product',
        id: product.id,
        text: formatProductName(product),
      })),
      
      // Brand suggestions from Brand model
      ...brandModelSuggestions.map(brand => ({
        type: 'brand',
        id: brand.id,
        text: brand.name,
        slug: brand.slug,
      })),
    ];

    // Remove duplicates and limit to 8 total suggestions
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.text === suggestion.text)
      )
      .slice(0, 8);

    return NextResponse.json({ suggestions: uniqueSuggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
} 