"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import CustomLoader from "@/components/CustomLoader";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productId: string;
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

export default function AdminOrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState<Record<string, number>>({});
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);
  const [otpInput, setOtpInput] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Extract order ID from params
  const orderId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (status === "loading" || !orderId) return;

      if (status === "unauthenticated") {
        router.push(`/login?callbackUrl=/admin/orders/${orderId}`);
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
        const response = await fetch(`/api/admin/orders?id=${orderId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }
        
        const data = await response.json();
        setOrder(data.order);
        
        // Store original items for comparison
        if (data.order && data.order.orderItems) {
          setOriginalItems(data.order.orderItems);
          
          // Initialize edited items with current quantities
          const initialEditedItems: Record<string, number> = {};
          data.order.orderItems.forEach((item: OrderItem) => {
            initialEditedItems[item.id] = item.quantity;
          });
          setEditedItems(initialEditedItems);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [status, session, router, orderId]);

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

  // Update order status
  const updateOrderStatus = async (newStatus: Order["status"]) => {
    if (!order) return;
    
    if (!confirm(`Are you sure you want to mark this order as ${newStatus.toLowerCase()}?`)) {
      return;
    }

    try {
      setProcessingAction(true);
      
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update order status to ${newStatus}`);
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      
      toast.success(`Order status updated to ${newStatus.toLowerCase()}`);
      
      // If we're setting to delivered after partial, exit edit mode
      if (newStatus === "DELIVERED") {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle quantity change in edit mode
  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 0) return;
    
    setEditedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  // Calculate new total based on edited quantities
  const calculateEditedTotal = () => {
    if (!order) return 0;
    
    return order.orderItems.reduce((sum, item) => {
      const quantity = editedItems[item.id] || 0;
      return sum + (item.price * quantity);
    }, 0);
  };

  // Save edited order
  const saveEditedOrder = async () => {
    if (!order) return;
    
    try {
      setProcessingAction(true);
      
      // Check if any quantities were changed
      const hasChanges = order.orderItems.some(item => 
        (editedItems[item.id] || 0) !== item.quantity
      );
      
      if (!hasChanges) {
        toast.error("No changes were made to the order");
        setProcessingAction(false);
        return;
      }
      
      const response = await fetch(`/api/admin/orders/${order.id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items: Object.entries(editedItems).map(([itemId, quantity]) => ({
            id: itemId,
            quantity
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order");
      }

      const data = await response.json();
      
      // Update local state with the updated order
      setOrder(data.order);
      
      // Reset edit mode
      setEditMode(false);
      toast.success("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setProcessingAction(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!order) return;
    
    try {
      setVerifyingOtp(true);
      
      const response = await fetch(`/api/admin/orders/${order.id}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          otp: otpInput 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify OTP");
      }

      // Process successful response
      await response.json();
      
      // Update local state
      setOrder(prev => prev ? { 
        ...prev, 
        status: "DELIVERED",
        otpVerified: true 
      } : null);
      
      setOtpInput("");
      toast.success("OTP verified successfully. Order marked as delivered.");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setVerifyingOtp(false);
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

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    return null; // Will be redirected by useEffect
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error || "Order not found"}</p>
            <div className="mt-4 space-x-4">
              <Button 
                onClick={() => router.push("/admin/orders")}
                variant="outline"
              >
                Back to Orders
              </Button>
              <Button 
                onClick={() => router.push("/admin")}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Order Details</h1>
          <Button 
            variant="outline"
            onClick={() => router.push("/admin/orders")}
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
                  ₹{editMode ? calculateEditedTotal().toFixed(2) : order.total.toFixed(2)}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {order.orderItems.length} item(s)
                </p>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="p-6">
            {/* Customer Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100 mt-1">
                    {order.user.name || "No name provided"}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {order.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Phone</p>
                  <p className="font-medium text-neutral-800 dark:text-neutral-100 mt-1">{order.phone}</p>
                </div>
              </div>
            </div>
            
            {/* Delivery Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Delivery Information
              </h3>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Delivery Address</p>
                <p className="font-medium text-neutral-800 dark:text-neutral-100 mt-1">{order.address}</p>
              </div>
              
              {order.note && (
                <div className="mt-4 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Customer Note</p>
                  <p className="text-neutral-800 dark:text-neutral-100 mt-1">{order.note}</p>
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200">
                  Order Items
                </h3>
                {order.status === "PARTIAL" && !editMode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditMode(true)}
                    disabled={processingAction}
                  >
                    Edit Items
                  </Button>
                )}
              </div>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-neutral-100 dark:bg-neutral-800">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {item.image && (
                              <div className="w-12 h-12 rounded-md overflow-hidden bg-white dark:bg-neutral-800 flex-shrink-0 mr-4 relative">
                                <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-neutral-800 dark:text-neutral-100">{item.name}</p>
                              {editMode && originalItems.find(oi => oi.id === item.id)?.quantity !== editedItems[item.id] && (
                                <p className="text-xs text-orange-500 mt-1">
                                  Original: {originalItems.find(oi => oi.id === item.id)?.quantity}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-neutral-800 dark:text-neutral-100">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {editMode ? (
                            <Input
                              type="number"
                              min="0"
                              value={editedItems[item.id] || 0}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-20 text-right ml-auto"
                            />
                          ) : (
                            <span className="font-medium text-neutral-800 dark:text-neutral-100">
                              {item.quantity}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-neutral-800 dark:text-neutral-100">
                          ₹{(item.price * (editMode ? (editedItems[item.id] || 0) : item.quantity)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-100 dark:bg-neutral-800">
                    <tr>
                      <td colSpan={3} className="py-3 px-4 text-right font-medium text-neutral-800 dark:text-neutral-100">
                        Total
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-neutral-800 dark:text-neutral-100">
                        ₹{editMode ? calculateEditedTotal().toFixed(2) : order.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Order Actions */}
            <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                Order Actions
              </h3>
              
              {editMode ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="default"
                    onClick={saveEditedOrder}
                    disabled={processingAction}
                  >
                    {processingAction ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Reset edited quantities to original
                      const resetItems: Record<string, number> = {};
                      order.orderItems.forEach(item => {
                        resetItems[item.id] = item.quantity;
                      });
                      setEditedItems(resetItems);
                      setEditMode(false);
                    }}
                    disabled={processingAction}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {order.status === "PENDING" && (
                    <>
                      <Button 
                        variant="default"
                        onClick={() => updateOrderStatus("SHIPPED")}
                        disabled={processingAction}
                      >
                        Mark as Shipped
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => updateOrderStatus("CANCELLED")}
                        disabled={processingAction}
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                  
                  {order.status === "SHIPPED" && (
                    <>
                      {!order.otpVerified && (
                        <div className="mt-2 text-sm text-blue-500">
                          OTP verification will mark the order as delivered
                        </div>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => updateOrderStatus("PARTIAL")}
                        disabled={processingAction}
                      >
                        Mark as Partial
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => updateOrderStatus("FAILED")}
                        disabled={processingAction}
                      >
                        Mark as Failed
                      </Button>
                    </>
                  )}
                  
                  {order.status === "PARTIAL" && !order.otpVerified && (
                    <div className="mt-2 text-sm text-blue-500">
                      OTP verification will mark the order as delivered
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* OTP Verification */}
            {(order.status === "SHIPPED" || order.status === "PARTIAL") && !order.otpVerified && (
              <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-4">
                  Delivery Verification
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start mb-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Important:</span> Ask the customer for their delivery OTP to confirm successful delivery. OTP verification will automatically mark the order as delivered.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-40 text-center font-mono tracking-widest"
                      maxLength={6}
                    />
                    <Button
                      onClick={verifyOtp}
                      disabled={otpInput.length !== 6 || verifyingOtp}
                      variant="default"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify & Deliver"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order already verified message */}
            {order.otpVerified && (
              <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Delivery verified with OTP
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}