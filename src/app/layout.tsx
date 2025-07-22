import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/providers/auth-provider";
import { OfflineProvider } from "@/providers/offline-provider";
import { OfflineDetector } from "@/components/OfflineDetector";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agra Ecom",
  description: "Your one-stop shop for all your needs",
  icons: {
    icon: "/favicon-new.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      
      <body className={`${inter.className} min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200`}>
        <OfflineProvider>
          <AuthProvider>
            <Navbar />
            <OfflineDetector />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
