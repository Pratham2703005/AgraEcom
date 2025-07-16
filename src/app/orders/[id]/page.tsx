"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  id: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "FAILED" | "PARTIAL";
  total: number;
  phone: string;
  address: string;
  note?: string;
  otp?: string;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
};

export default function OrderDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Extract order ID from params
  const orderId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (status === "loading" || !orderId) return;

      if (status === "unauthenticated") {
        router.push(`/login?callbackUrl=/orders/${orderId}`);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/orders?id=${orderId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [status, router, orderId]);

  // Cancel order
  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancellingOrder(true);
      
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, status: "CANCELLED" } : null);
      
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setCancellingOrder(false);
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>;
      case "SHIPPED":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Shipped</Badge>;
      case "DELIVERED":
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Cancelled</Badge>;
      case "FAILED":
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Failed</Badge>;
      case "PARTIAL":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">Partial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Loading state while session is loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=${encodeURIComponent(`/orders/${orderId}`)}`);
    return null;
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error || "Order not found"}</p>
            <div className="mt-4 space-x-4">
              <Button 
                onClick={() => router.push("/orders")}
                variant="outline"
              >
                Back to Orders
              </Button>
              <Button 
                onClick={() => router.push("/")}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Order Details</h1>
          <Button 
            variant="outline"
            onClick={() => router.push("/orders")}
            className="text-sm"
          >
            Back to Orders
          </Button>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700 overflow-hidden">
          {/* Order Header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    Order #{order.id.slice(-6).toUpperCase()}
                  </h2>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Placed on {format(new Date(order.createdAt), "PPP")} at {format(new Date(order.createdAt), "p")}
                </p>
                {order.updatedAt !== order.createdAt && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Last updated: {format(new Date(order.updatedAt), "PPP p")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-xl text-neutral-800 dark:text-neutral-100">
                  ₹{order.total.toFixed(2)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {order.orderItems.length} item(s)
                </p>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="p-6">
            {/* Delivery Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Phone</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100 mt-1">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Delivery Address</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100 mt-1">{order.address}</p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Order Items
              </h3>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="p-4 flex items-center">
                    {item.image && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-white dark:bg-neutral-800 flex-shrink-0 mr-4 relative">
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">{item.name}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        ₹{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Order Summary */}
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Order Summary
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <p className="text-neutral-600 dark:text-neutral-400">Items Total</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">₹{order.total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-neutral-600 dark:text-neutral-400">Delivery</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">Free</p>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <p className="font-medium text-neutral-800 dark:text-neutral-100">Total</p>
                  <p className="font-medium text-lg text-neutral-800 dark:text-neutral-100">₹{order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Delivery OTP */}
            {order.status !== "CANCELLED" && order.status !== "FAILED" && order.otp && !order.otpVerified && (
              <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                  Delivery Verification
                </h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">One-Time Password (OTP) for Delivery</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Share this OTP with the delivery person when your order arrives. This helps us confirm successful delivery.
                      </p>
                      <div className="mt-3 bg-white dark:bg-neutral-800 border border-yellow-300 dark:border-yellow-700 rounded-md p-3 flex justify-center">
                        <p className="font-mono text-xl font-bold tracking-widest text-yellow-800 dark:text-yellow-200 select-all">
                          {order.otp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order Actions */}
            {(order.status === "PENDING" || order.status === "SHIPPED") && !order.otpVerified && (
              <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                  Order Actions
                </h3>
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder}
                  className="w-full md:w-auto"
                >
                  {cancellingOrder ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            )}
            
            {/* Order Terms */}
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Order Terms
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>No returns will be accepted after delivery.</li>
                  <li>Please check the products before accepting the order.</li>
                  <li>Payment mode is Cash on Delivery (COD) only.</li>
                  <li>Order may be cancelled if products are not available.</li>
                  <li>Orders are usually delivered within 1-3 days.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}