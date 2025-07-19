"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useSessionUpdate } from "@/lib/hooks";
import { formatProductName } from "@/lib/utils";
import CustomLoader from "@/components/CustomLoader";

const checkoutSchema = z.object({
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\+?[0-9]+$/, { message: "Phone number can only contain digits and + sign" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  note: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    offers: Record<string, number>;
    brand?: { id: string; name: string; slug: string; imageUrl: string } | null;
    weight: string | null;
    images: string[];
    piecesLeft: number | null;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { updateUserSession } = useSessionUpdate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "",
      address: "",
      note: "",
      termsAccepted: false,
    },
  });

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/checkout");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/cart");
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await response.json();
        
        if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
          router.push("/cart");
          toast.error("Your cart is empty");
          return;
        }
        
        setCart(data.cart);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [status, router]);

  // Set form defaults from user profile
  useEffect(() => {
    if (session?.user) {
      form.setValue("phone", session.user.phone || "");
      form.setValue("address", session.user.deliveryAddress || session.user.address || "");
    }
  }, [session, form]);

  // Helper function to calculate price with offers based on quantity
  const calculatePriceWithOffers = (product: CartItem['product'], quantity: number) => {
    if (!product || !product.offers) return product.mrp;
    
    // Get all available quantity thresholds
    const quantities = Object.keys(product.offers)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Find the highest applicable discount for this quantity
    let applicableOffer = "1"; // Default to offer for quantity 1
    for (const q of quantities) {
      if (quantity >= q) {
        applicableOffer = q.toString();
      } else {
        break;
      }
    }
    
    const discountPercent = product.offers[applicableOffer] || 0;
    return product.mrp * (1 - discountPercent / 100);
  };

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, discount: 0, total: 0 };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.mrp * item.quantity,
      0
    );

    const total = cart.items.reduce(
      (sum, item) => sum + calculatePriceWithOffers(item.product, item.quantity) * item.quantity,
      0
    );

    return {
      subtotal,
      discount: subtotal - total,
      total,
    };
  };

  // Format helper
  const formatCartItemName = (item: CartItem) => {
    return formatProductName(item.product);
  };

  // Place order
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
      return;
    }

    try {
      setPlacingOrder(true);
      
      // Process the phone number
      const phone = data.phone.startsWith("+") ? data.phone : `+91${data.phone}`;
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          address: data.address,
          note: data.note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const orderData = await response.json();

      // Update profile with delivery info if changed
      if (session?.user && (session.user.phone !== phone || session.user.deliveryAddress !== data.address)) {
        try {
          await fetch("/api/profile", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone,
              deliveryAddress: data.address,
            }),
          });

          // Update session
          await updateUserSession({
            phone,
            deliveryAddress: data.address,
          });
        } catch (err) {
          console.error("Error updating profile:", err);
          // Non-blocking error, just log it
        }
      }
      
      toast.success("Order placed successfully!");
      router.push(`/orders/${orderData.order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Loading state while session is loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8 h-[calc(100vh-100px)] flex justify-center items-center">
            <CustomLoader size="lg" />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button 
              onClick={() => router.push("/cart")}
              className="mt-4"
            >
              Return to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Order Summary</h2>
            
            <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {cart?.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between">
                  <div>
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      {formatCartItemName(item)}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Qty: {item.quantity} × ₹{calculatePriceWithOffers(item.product, item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">
                    ₹{(calculatePriceWithOffers(item.product, item.quantity) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between">
                <p className="text-neutral-600 dark:text-neutral-400">Subtotal</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">
                  ₹{totals.subtotal.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-neutral-600 dark:text-neutral-400">Discount</p>
                <p className="font-medium text-green-600 dark:text-green-500">
                  -₹{totals.discount.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">Total</p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  ₹{totals.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Delivery Information */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700 p-6">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Delivery Information</h2>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="phone" className="text-neutral-700 dark:text-neutral-300">Phone Number</Label>
                <div className="mt-1">
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    {...form.register("phone")}
                    className="w-full"
                  />
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="address" className="text-neutral-700 dark:text-neutral-300">Delivery Address</Label>
                <div className="mt-1">
                  <Input
                    id="address"
                    placeholder="Enter your delivery address"
                    {...form.register("address")}
                    className="w-full"
                  />
                  {form.formState.errors.address && (
                    <p className="mt-1 text-sm text-red-500">{form.formState.errors.address.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="note" className="text-neutral-700 dark:text-neutral-300">Order Note (Optional)</Label>
                <div className="mt-1">
                  <textarea
                    id="note"
                    placeholder="Any special instructions or notes for your order"
                    {...form.register("note")}
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2">Order Terms</h3>
                <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>No returns will be accepted after delivery.</li>
                  <li>Please check the products before accepting the order.</li>
                  <li>Payment mode is Cash on Delivery (COD) only.</li>
                  <li>Order may be cancelled if products are not available.</li>
                  <li>Orders are usually delivered within 1-3 days.</li>
                </ul>
                
                <div className="mt-4 flex items-start">
                  <Checkbox
                    id="terms"
                    checked={form.watch("termsAccepted")}
                    onCheckedChange={(checked) => {
                      form.setValue("termsAccepted", checked === true);
                    }}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="terms"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    I have read and agree to the order terms and conditions
                  </Label>
                </div>
                {form.formState.errors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-500">{form.formState.errors.termsAccepted.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full py-3 text-base"
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">Processing...</span>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </span>
                ) : (
                  "Place Order"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}