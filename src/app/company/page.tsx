"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState("about");
  
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
      <h1 className="text-3xl font-bold mb-8 sm:pl-10">Company</h1>
      
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
              <TabsTrigger value="about" className="w-full text-center">About Us</TabsTrigger>
              <TabsTrigger value="careers" className="w-full text-center">Careers</TabsTrigger>
              <TabsTrigger value="contact" className="w-full text-center">Contact Us</TabsTrigger>
              <TabsTrigger value="privacy" className="w-full text-center">Privacy Policy</TabsTrigger>
              <TabsTrigger value="terms" className="w-full text-center">Terms of Service</TabsTrigger>
              <TabsTrigger value="accessibility" className="w-full text-center">Accessibility</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Content area */}
        <div className="md:w-3/4">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} className="w-full">
              <TabsContent value="about" className="mt-0">
                <h2 className="text-2xl font-bold mb-4">About Us</h2>
                <p className="mb-4">
                    Welcome to {process.env.NEXT_PUBLIC_APP_NAME} — a local online shopping platform built to connect small and medium businesses with digital customers. We believe every shop, no matter how small, should be discoverable online.
                </p>
                <p className="mb-4">
                    Founded in 2025, our mission is to bridge the gap between traditional retail and modern e-commerce. Whether it&apos;s your neighborhood grocery store, a clothing boutique, or a hardware shop, {process.env.NEXT_PUBLIC_APP_NAME} helps bring their inventory online and closer to customers like you.  
                </p>
                <p className="mb-4">
                    {process.env.NEXT_PUBLIC_APP_NAME} allows customers to browse, order, and track local products easily, while empowering local shopkeepers with a modern dashboard to manage orders, inventory, and deliveries.
                </p>
                <p>
                    We are committed to promoting local economy, building trust between buyers and sellers, and making everyday shopping faster, smarter, and more reliable.
                </p>
            </TabsContent>

            <TabsContent value="careers" className="mt-0">
            <h2 className="text-2xl font-bold mb-4">Careers</h2>
            <p className="mb-4">
                We&apos;re building the future of local commerce. If you&apos;re passionate about technology, community-driven impact, and problem-solving at scale, we&apos;d love to have you on board.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">Current Openings</h3>

            <div className="space-y-4">
                <div className="border p-4 rounded-md">
                <h4 className="font-medium">Frontend Developer (Next.js + Tailwind)</h4>
                <p className="text-sm text-gray-600 mb-2">Internship • Remote</p>
                <p>Help us improve our customer and admin-facing UI. Work on real-time cart, order tracking, and email flows.</p>
                </div>

                <div className="border p-4 rounded-md">
                <h4 className="font-medium">Operations Support Intern</h4>
                <p className="text-sm text-gray-600 mb-2">Part-time • Hybrid</p>
                <p>Coordinate with local vendors and help manage inventory syncing, issues, and on-time order fulfillment.</p>
                </div>

                <div className="border p-4 rounded-md">
                <h4 className="font-medium">Marketing Intern</h4>
                <p className="text-sm text-gray-600 mb-2">Remote • Flexible</p>
                <p>Help us grow our local user base through Instagram, WhatsApp, and local ad strategies.</p>
                </div>
            </div>

            <p className="mt-6">
                To apply, send your CV or portfolio to <strong>pk2732004@gmail.com</strong>
            </p>
            </TabsContent>

            

                
            <TabsContent value="contact" className="mt-0">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="mb-6">
                    Have questions, suggestions, or need support? We&apos;re here to help.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
                    <p className="mb-1">Email: support@yourdomain.com</p>
                    <p className="mb-1">Phone: +91-XXXXXXXXXX</p>
                    <p className="mb-4">Hours: Mon–Sat, 10am – 6pm IST</p>

                    <h3 className="text-xl font-semibold mb-2 mt-4">Business Inquiries</h3>
                    <p className="mb-1">Email: business@yourdomain.com</p>
                    <p>For partnerships, collaborations, or B2B listings.</p>
                    </div>

                    <div>
                    <h3 className="text-xl font-semibold mb-2">Office Address</h3>
                    <p className="mb-1">Shop No. X, Main Market</p>
                    <p className="mb-1">[Your Area or Locality]</p>
                    <p className="mb-1">[City], [State], [PIN]</p>
                    <p>India</p>
                    </div>
                </div>
                </TabsContent>

                
                <TabsContent value="privacy" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
  <p className="mb-4">Last updated: July 13, 2025</p>

  <h3 className="text-xl font-semibold mb-2">1. Information Collection</h3>
  <p className="mb-4">
    We collect personal details such as your name, phone number, address, and email when you place orders, register an account, or contact us.
  </p>

  <h3 className="text-xl font-semibold mb-2">2. How We Use Data</h3>
  <p className="mb-4">
    We use this information strictly to process orders, provide customer support, and improve our services. Your contact info may also be used to send important updates or delivery confirmation.
  </p>

  <h3 className="text-xl font-semibold mb-2">3. Data Storage</h3>
  <p className="mb-4">
    All data is securely stored in encrypted databases (MongoDB Atlas) and is never sold or shared with third parties for marketing purposes.
  </p>

  <h3 className="text-xl font-semibold mb-2">4. Cookies</h3>
  <p className="mb-4">
    We use minimal cookies only to maintain session or cart data. No third-party tracking is involved.
  </p>

  <h3 className="text-xl font-semibold mb-2">5. Contact Us</h3>
  <p>
    If you have any privacy-related concerns, please contact: privacy@yourdomain.com
  </p>
</TabsContent>

                
<TabsContent value="terms" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
  <p className="mb-4">Last updated: July 13, 2025</p>

  <h3 className="text-xl font-semibold mb-2">1. Overview</h3>
  <p className="mb-4">
    By using our platform, you agree to these terms. We act as a local marketplace for goods provided by small businesses and handle logistics, delivery, and support.
  </p>

  <h3 className="text-xl font-semibold mb-2">2. Order Processing</h3>
  <p className="mb-4">
    Orders placed are subject to availability. If products are not in stock, your order may be partially fulfilled or canceled, with items automatically restocked.
  </p>

  <h3 className="text-xl font-semibold mb-2">3. Returns & Refunds</h3>
  <p className="mb-4">
    We currently do not support returns or exchanges. Please inspect the order at delivery before accepting. Any issues must be reported immediately.
  </p>

  <h3 className="text-xl font-semibold mb-2">4. Delivery Verification</h3>
  <p className="mb-4">
    Orders may require OTP verification at delivery for confirmation and fraud prevention.
  </p>

  <h3 className="text-xl font-semibold mb-2">5. Modifications</h3>
  <p>
    We reserve the right to change these terms at any time without prior notice. Continued use of the platform implies acceptance of the updated terms.
  </p>
</TabsContent>

                
<TabsContent value="accessibility" className="mt-0">
  <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
  <p className="mb-4">
    We are committed to ensuring our website is usable by everyone, including users with disabilities.
  </p>

  <h3 className="text-xl font-semibold mb-2">Standards</h3>
  <p className="mb-4">
    Our site aims to follow WCAG 2.1 Level AA standards. Features like keyboard navigation, alt text, and color contrast are built into the design.
  </p>

  <h3 className="text-xl font-semibold mb-2">Feedback</h3>
  <p>
    If you experience any issues accessing our content or need assistance, please contact us at accessibility@yourdomain.com.
  </p>
</TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 