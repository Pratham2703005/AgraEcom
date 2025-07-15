"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
  note?: string;
  otp?: string;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  user: {
    id: string;
    name?: string;
    email: string;
  };
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      // Check for admin role
      if (session?.user?.role !== "ADMIN") {
        router.push("/");
        toast.error("You don't have permission to access this page");
        return;
      }

      try {
        setLoading(true);
        // Append status filter if present
        const url = statusFilter 
          ? `/api/admin/orders?status=${statusFilter}` 
          : "/api/admin/orders";
        
        const response = await fetch(url);
        
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
  }, [status, session, router, statusFilter]);

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

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    if (!statusFilter) return true;
    return order.status === statusFilter.toUpperCase();
  });

  // Get page title based on status filter
  const getPageTitle = () => {
    if (!statusFilter) return "All Orders";
    
    switch (statusFilter.toLowerCase()) {
      case 'pending':
        return "Pending Orders";
      case 'shipped':
        return "Shipped Orders";
      case 'delivered':
        return "Delivered Orders";
      case 'cancelled':
        return "Cancelled Orders";
      default:
        return `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase()} Orders`;
    }
  };

  // Loading state while session is loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    return null; // Will be redirected by useEffect
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button 
              onClick={() => router.push("/admin")}
              className="mt-4"
            >
              Return to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only show the list for the selected status (or all orders)
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">{getPageTitle()}</h1>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Back to Dashboard
            </Button>
            {statusFilter && (
              <Button
                variant="default"
                onClick={() => router.push("/admin/orders")}
              >
                View All Orders
              </Button>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-md border border-neutral-100 dark:border-neutral-700 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
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
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Customer: {order.user.name || order.user.email}
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
                <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 