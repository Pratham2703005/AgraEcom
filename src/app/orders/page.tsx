"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/orders");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/orders");
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, router]);

  // Cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to cancel order");
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: "CANCELLED" } : order
      ));
      
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
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
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=${encodeURIComponent("/orders")}`);
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button 
              onClick={() => router.push("/")}
              className="mt-4"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty orders
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">My Orders</h1>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-md border border-neutral-100 dark:border-neutral-700 text-center">
            <svg className="mx-auto h-16 w-16 text-neutral-400 dark:text-neutral-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">No orders yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link 
              href="/products" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">My Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700 overflow-hidden">
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
                      Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-neutral-800 dark:text-neutral-100">
                      Total: ₹{order.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {order.orderItems.length} item(s)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Phone</p>
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">{order.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Address</p>
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">{order.address}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                  Order Items
                </h3>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0 relative">
                            <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-neutral-100">{item.name}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            ₹{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
                <div className="flex justify-between">
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium"
                  >
                    View Details
                  </Link>
                  
                  {order.status === "PENDING" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                    >
                      {cancellingOrder === order.id ? "Cancelling..." : "Cancel Order"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}