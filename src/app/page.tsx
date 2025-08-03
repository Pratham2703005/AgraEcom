import { BrandsSectionWrapper } from "@/components/BrandsSectionWrapper";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { db } from "@/lib/db";
import Image from "next/image";
import { formatProductName } from "@/lib/utils";
import { Prisma } from "@prisma/client";

// Type guard to check if offers is a valid Record<string, number>
export const dynamic = 'force-dynamic';
function isValidOffers(offers: Prisma.JsonValue | null): offers is Record<string, number> {
  return (
    offers !== null &&
    typeof offers === 'object' &&
    !Array.isArray(offers) &&
    Object.values(offers).every(value => typeof value === 'number')
  );
}

// Helper function to get discount percentage
function getDiscountPercentage(offers: Prisma.JsonValue | null): number {
  if (!isValidOffers(offers)) return 0;
  return offers["1"] || 0;
}

// Helper function to calculate discounted price
function calculateDiscountedPrice(mrp: number, offers: Prisma.JsonValue | null): number {
  const discountPercent = getDiscountPercentage(offers);
  return mrp * (1 - discountPercent / 100);
}

// Fetch high demand products for the featured section
async function getHighDemandProducts() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        demand: 'desc',
      },
      take: 4,
      include: {
        brand: true
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching high demand products:", error);
    return [];
  }
}

export default async function Home() {
  // Get session for future use
  await getSession();

  // Fetch high demand products
  const featuredProducts = await getHighDemandProducts();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[var(--primary-light)] to-[var(--secondary-light)]">
       
        <div className="mx-auto flex flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl text-neutral-950">
            Beauty That Speaks <span className="text-[var(--primary-dark)]">For You</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-[var(--neutral-700)]">
            Discover premium skincare and cosmetics that enhance your natural beauty.
            Formulated with care for all skin types.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link
              href="/products"
              className="btn btn-primary btn-lg"
            >
              Shop Now
            </Link>
            <Link
              href="/company#about"
              className="btn btn-outline btn-lg !text-neutral-950 hover:!text-neutral-100  !border-neutral-950 hover:!bg-neutral-800"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <BrandsSectionWrapper />

      {/* Featured Products */}
      <section className="bg-[var(--primary)] dark:bg-neutral-800 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-neutral-50">Featured Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const discountPercent = getDiscountPercentage(product.offers);
              const discountedPrice = calculateDiscountedPrice(product.mrp, product.offers);
              
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-neutral-100 h-full flex flex-col">
                    {/* Fixed aspect ratio image container */}
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={formatProductName(product)}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Discount badge */}
                      {discountPercent > 0 && (
                        <div className="absolute left-3 top-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                          -{discountPercent}%
                        </div>
                      )}

                      {/* Trending badge */}
                      <div className="absolute right-3 top-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                        Trending
                      </div>
                    </div>

                    {/* Fixed height content container */}
                    <div className="p-4 flex flex-col flex-1 bg-white dark:bg-neutral-800">
                      {/* Product name - fixed height with line clamp */}
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100  group-hover:text-blue-600 transition-colors duration-200 text-lg leading-[1.75rem] mb-1 line-clamp-2 min-h-[2.5rem]">
                        {formatProductName(product)}
                      </h3>

                      {/* Brand - fixed height */}
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 min-h-[1.5rem]">
                        {product.brand ? product.brand.name : 'No Brand'}
                      </p>

                      {/* Price section - pushed to bottom */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                              ₹{discountedPrice.toFixed(2)}
                            </span>
                            {discountPercent > 0 && (
                              <span className="text-sm text-neutral-400 dark:text-neutral-400 line-through">
                                ₹{product.mrp.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* View all button */}
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 bg-[var(--primary-dark)] text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              View All Products
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Why Choose Us</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-[var(--primary-light)] p-4 text-white dark:text-[var(--primary-dark)]">
                  <div className="h-12 w-12">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-[var(--neutral-600)]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--primary)] dark:bg-neutral-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Beauty Routine?</h2>
          <p className="mb-8 text-lg">
            Join thousands of satisfied customers who have elevated their skincare and makeup routine with our products.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-lg font-medium text-[var(--primary)] dark:text-neutral-950 transition-colors hover:bg-[var(--neutral-100)]"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

// Updated benefits data
const benefits = [
  {
    title: "Free Shipping",
    description: "Enjoy free shipping on all orders over ₹500 within Agra.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: "Best Customer Support",
    description: "Our dedicated team is available 24/7 to assist you with any questions or concerns.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    title: "Better Deals Than Amazon/Flipkart",
    description: "We offer more competitive prices and exclusive deals you won't find on major marketplaces.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Support Local Business",
    description: "By shopping with us, you're supporting a local Indian business and our community.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
];