"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("customer-service");
  
  // Handle hash changes for direct links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setActiveTab(hash);
      }
    };
    
    handleHashChange(); // Handle initial hash
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 sm:pl-10">Help Center</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar with tabs */}
        <div className="md:w-1/4">
          <Tabs 
            orientation="vertical" 
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              window.history.pushState(null, "", `#${value}`);
            }}
            className="w-full"
          >
            <TabsList className="flex flex-col h-auto space-y-2">
              <TabsTrigger value="customer-service" className="w-full text-center">Customer Service</TabsTrigger>
              <TabsTrigger value="track-order" className="w-full text-center">Track Order</TabsTrigger>
              <TabsTrigger value="returns" className="w-full text-center">Returns & Exchanges</TabsTrigger>
              <TabsTrigger value="shipping" className="w-full text-center">Shipping Information</TabsTrigger>
              <TabsTrigger value="faq" className="w-full text-center">FAQ</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Content area */}
        <div className="md:w-3/4">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} className="w-full">
            
<TabsContent value="customer-service" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Customer Service</h2>
  <p className="mb-4">
    Our customer service team is here to help you with any questions or concerns you may have about our products or services.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">Contact Information</h3>
  <p className="mb-1">Email: support@example.com</p>
  <p className="mb-1">Phone: (123) 456-7890</p>
  <p className="mb-4">Hours: Monday-Friday, 9am-5pm EST</p>

  <h3 className="text-xl font-semibold mt-6 mb-2">Response Times</h3>
  <p className="mb-4">
    We strive to respond to all inquiries within 24 hours during business days. For urgent matters, we recommend calling our customer service line for immediate assistance.
  </p>

  <h3 className="text-xl font-semibold mt-6 mb-2">Common Issues</h3>
  <p>
    For frequently asked questions about orders, shipping, returns, and product information, please check our FAQ section. If you can&apos;t find the answer you&apos;re looking for, don&apos;t hesitate to contact us directly.
  </p>
</TabsContent>

<TabsContent value="track-order" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Track Your Order</h2>
  <p className="mb-6">
    You can easily track the status of your order to see when it will arrive.
  </p>

  <h3 className="text-xl font-semibold mb-2">How to Track Your Order</h3>
  <ol className="list-decimal pl-6 mb-6 space-y-2">
    <li>Log in to your account on our website</li>
    <li>Go to &quot;My Orders&quot; in your account dashboard</li>
    <li>Find the order you want to track and click &quot;Track Order&quot;</li>
    <li>You&apos;ll be redirected to the carrier&apos;s website with your tracking information</li>
  </ol>

  <p className="mb-6">
    Alternatively, if you received a shipping confirmation email, you can click the tracking link provided in the email.
  </p>

  <h3 className="text-xl font-semibold mb-2">Order Statuses Explained</h3>
  <div className="space-y-2 mb-6">
    <p><strong>Processing:</strong> We&apos;ve received your order and are preparing it for shipment.</p>
    <p><strong>Shipped:</strong> Your order has been shipped and is on its way to you.</p>
    <p><strong>Out for Delivery:</strong> Your order is scheduled for delivery today.</p>
    <p><strong>Delivered:</strong> Your order has been delivered to the shipping address.</p>
  </div>

  <p>
    If you have any questions about your order status or if there seems to be a delay, please contact our customer service team.
  </p>
</TabsContent>

<TabsContent value="returns" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Returns & Exchanges</h2>
  <p className="mb-6">
    We want you to be completely satisfied with your purchase. If you&apos;re not, we offer a simple returns and exchanges process.
  </p>

  <h3 className="text-xl font-semibold mb-2">Return Policy</h3>
  <p className="mb-4">
    You may return most new, unopened items within 30 days of delivery for a full refund. We&apos;ll also pay the return shipping costs if the return is a result of our error (you received an incorrect or defective item, etc.).
  </p>

  <h3 className="text-xl font-semibold mb-2">How to Return an Item</h3>
  <ol className="list-decimal pl-6 mb-6 space-y-2">
    <li>Log in to your account on our website</li>
    <li>Go to &quot;My Orders&quot; and find the order containing the item you want to return</li>
    <li>Click &quot;Return Items&quot; and follow the instructions</li>
    <li>Print the return shipping label and attach it to your package</li>
    <li>Drop off the package at any authorized shipping location</li>
  </ol>

  <h3 className="text-xl font-semibold mb-2">Exchanges</h3>
  <p className="mb-4">
    If you&apos;d like to exchange an item for a different size, color, or product, please follow the return process and place a new order for the desired item. This ensures the fastest processing time.
  </p>

  <h3 className="text-xl font-semibold mb-2">Refund Processing</h3>
  <p>
    Once we receive your return, we&apos;ll inspect the item and process your refund. Refunds are typically processed within 5-7 business days, and you&apos;ll receive an email notification when your refund has been issued.
  </p>
</TabsContent>

<TabsContent value="shipping" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
  <p className="mb-6">
    We offer several shipping options to meet your needs. Here&apos;s everything you need to know about our shipping policies and procedures.
  </p>

  <h3 className="text-xl font-semibold mb-2">Shipping Options</h3>
  <div className="space-y-4 mb-6">
    <div className="border p-4 rounded-md">
      <h4 className="font-medium">Standard Shipping</h4>
      <p className="text-sm text-gray-600 mb-2">3-5 business days</p>
      <p>Free for orders over $50, $5.99 for orders under $50</p>
    </div>

    <div className="border p-4 rounded-md">
      <h4 className="font-medium">Express Shipping</h4>
      <p className="text-sm text-gray-600 mb-2">2 business days</p>
      <p>$9.99 for all orders</p>
    </div>

    <div className="border p-4 rounded-md">
      <h4 className="font-medium">Overnight Shipping</h4>
      <p className="text-sm text-gray-600 mb-2">Next business day</p>
      <p>$19.99 for all orders</p>
    </div>
  </div>

  <h3 className="text-xl font-semibold mb-2">Shipping Restrictions</h3>
  <p className="mb-4">
    We currently ship to the United States and Canada. Unfortunately, we cannot ship to P.O. boxes, APO/FPO addresses, or international destinations outside of Canada at this time.
  </p>

  <h3 className="text-xl font-semibold mb-2">Order Processing</h3>
  <p>
    Orders are typically processed within 1-2 business days. Once your order has shipped, you&apos;ll receive a confirmation email with tracking information. Please note that shipping times are estimates and may vary depending on location and weather conditions.
  </p>
</TabsContent>

<TabsContent value="faq" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
  <p className="mb-6">
    Find answers to our most commonly asked questions below.
  </p>

  <div className="space-y-6">
    <div>
      <h3 className="text-xl font-semibold mb-2">Are your products cruelty-free?</h3>
      <p>
        Yes, all of our products are cruelty-free. We do not test on animals at any stage of product development, and we do not work with suppliers who test on animals.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">What ingredients do you avoid in your products?</h3>
      <p>
        We avoid using parabens, sulfates, phthalates, synthetic fragrances, and artificial colors in our products. We believe in clean, effective formulations that are safe for you and the environment.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">How can I determine which products are right for my skin type?</h3>
      <p>
        All of our products are labeled with the skin types they&apos;re best suited for. You can also take our skin quiz on the homepage to get personalized recommendations based on your skin concerns and goals.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">Do you offer samples?</h3>
      <p>
        Yes, we offer samples with every order. You can select two free samples at checkout. We also have travel-sized versions of our most popular products available for purchase.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">How long will my products last?</h3>
      <p>
        The shelf life of our products varies depending on the formulation. Most products have a shelf life of 12-24 months unopened. Once opened, we recommend using the product within 6-12 months for optimal effectiveness. Each product has a PAO (Period After Opening) symbol that indicates how long the product remains safe to use after opening.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-2">Can I cancel or modify my order after it&apos;s been placed?</h3>
      <p>
        We process orders quickly to ensure fast shipping. If you need to cancel or modify your order, please contact our customer service team immediately. We&apos;ll do our best to accommodate your request, but we cannot guarantee changes once the order has entered the processing stage.
      </p>
    </div>
  </div>
</TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 