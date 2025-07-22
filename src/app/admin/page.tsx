"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clipboard, ShoppingBag, Truck, CheckCircle, XCircle, Users } from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch order and user counts for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (session?.user?.role !== "ADMIN") return;
      
      try {
        // Fetch order counts
        const orderResponse = await fetch('/api/admin/orders/count');
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrderCounts(orderData);
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [session]);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  const adminMenuItems = [
    {
      title: "Products",
      icon: <Package className="h-6 w-6" />,
      items: [
        { name: "Add New Product", link: "/admin/products/new" },
        { name: "View All Products", link: "/admin/products/view-all" },
        { name: "Manage Stock", link: "/admin/products/stock" },
      ]
    },
    {
      title: "Banners",
      icon: <Clipboard className="h-6 w-6" />,
      items: [
        { name: "Add New Banner", link: "/admin/banners/new" },
        { name: "View All Banners", link: "/admin/banners" },
      ]
    },
    {
      title: "Brands",
      icon: <ShoppingBag className="h-6 w-6" />,
      items: [
        { name: "Add New Brand", link: "/admin/brands/new" },
        { name: "View All Brands", link: "/admin/brands/view-all" },
      ]
    },
    {
      title: "Users",
      icon: <Users className="h-6 w-6" />,
      items: [
        { name: "Manage Users", link: "/admin/users" },
        { name: "User Analytics", link: "/admin/users/analytics" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Welcome back, {session?.user?.name}! Manage your store from here.
          </p>
        </div>

        {/* Order Status Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/orders?status=pending" className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 transition-all hover:shadow-md border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400 mr-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Pending Orders</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{loading ? "..." : orderCounts.pending}</h3>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/orders?status=shipped" className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 transition-all hover:shadow-md border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Shipped Orders</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{loading ? "..." : orderCounts.shipped}</h3>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/orders?status=delivered" className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 transition-all hover:shadow-md border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Delivered Orders</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{loading ? "..." : orderCounts.delivered}</h3>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/orders?status=cancelled" className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 transition-all hover:shadow-md border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 mr-4">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Cancelled Orders</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{loading ? "..." : orderCounts.cancelled}</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>

        

        {/* Main Admin Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{item.title}</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage your {item.title.toLowerCase()} here.</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {item.items.map((subItem, subIndex) => (
                  <Link 
                    key={subIndex} 
                    href={subItem.link}
                    className="flex items-center px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    <span>{subItem.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 