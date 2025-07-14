"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingBag, Users, BarChart2, Truck, Settings, Clipboard, Tag, Image } from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  const menuItems = [
    {
      title: "Products",
      description: "Manage your product catalog",
      icon: <Package className="h-6 w-6" />,
      links: [
        { text: "Add New Product", href: "/admin/products/new" },
        { text: "View All Products", href: "/admin/products/view-all" },
        { text: "Manage Stock", href: "/admin/products/stock" },
      ],
    },
    {
      title: "Brands",
      description: "Manage product brands",
      icon: <Tag className="h-6 w-6" />,
      links: [
        { text: "Add New Brand", href: "/admin/brands/new" },
        { text: "View All Brands", href: "/admin/brands/view-all" },
      ],
    },
    {
      title: "Banners",
      description: "Manage promotional banners",
      icon: <Image className="h-6 w-6" />,
      links: [
        { text: "Add New Banner", href: "/admin/banners/new" },
        { text: "Manage Banners", href: "/admin/banners" },
      ],
    },
    {
      title: "Orders",
      description: "View and manage customer orders",
      icon: <ShoppingBag className="h-6 w-6" />,
      links: [
        { text: "View All Orders", href: "/admin/orders" },
        { text: "Pending Orders", href: "/admin/orders/pending" },
      ],
    },
    {
      title: "Customers",
      description: "Manage customer accounts",
      icon: <Users className="h-6 w-6" />,
      links: [
        { text: "View All Customers", href: "/admin/customers" },
      ],
    },
    {
      title: "Analytics",
      description: "View sales and performance metrics",
      icon: <BarChart2 className="h-6 w-6" />,
      links: [
        { text: "Sales Dashboard", href: "/admin/analytics" },
      ],
    },
    {
      title: "Shipping",
      description: "Manage shipping options and rates",
      icon: <Truck className="h-6 w-6" />,
      links: [
        { text: "Shipping Methods", href: "/admin/shipping" },
      ],
    },
    {
      title: "Settings",
      description: "Configure store settings",
      icon: <Settings className="h-6 w-6" />,
      links: [
        { text: "General Settings", href: "/admin/settings" },
      ],
    },
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
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
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {item.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex} 
                    href={link.href}
                    className="flex items-center px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <Clipboard className="h-4 w-4 mr-2" />
                    <span>{link.text}</span>
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