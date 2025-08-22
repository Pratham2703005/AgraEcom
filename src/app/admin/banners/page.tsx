import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeftIcon, EditIcon } from "lucide-react";
import { authOptions } from "@/lib/auth"; // Adjust path as needed
import DeleteBannerButton from "./DeleteBannerButton";
import { getBanners } from "@/lib/banner-service"; // Create this service

type Banner = {
  id: string;
  title: string;
  description: string | null;
  bannerImg: string;
  link: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default async function BannersManagementPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session) {
    redirect("/login");
  }

  // Redirect if not admin
  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch banners on the server
  let banners: Banner[] = [];
  let error: string | null = null;

  try {
    banners = await getBanners();
  } catch (err) {
    console.error("Error fetching banners:", err);
    error = "Failed to load banners. Please try again later.";
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Link 
              href="/admin"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 px-4">
        <div className="flex items-center">
          <Link 
            href="/admin" 
            className="px-2 sm:px-4 py-2 rounded-lg text-neutral-700 dark:text-neutral-100"
          >
            <ArrowLeftIcon className="size-6" />
          </Link>
          <h1 className="text-2xl font-bold ml-2">Banners Manager</h1>
        </div>
        <Link 
          href="/admin/banners/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          +
        </Link>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No banners found. Create your first banner!
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-32 relative">
                        <Image 
                          src={banner.bannerImg} 
                          alt={banner.title} 
                          fill
                          sizes="128px"
                          className="object-cover rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {banner.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {banner.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        banner.active 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {banner.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {banner.link ? (
                          <a 
                            href={banner.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View Link
                          </a>
                        ) : (
                          "No link"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/banners/edit/${banner.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4 inline-flex items-center"
                      >
                        <EditIcon className="size-4 mr-1" />
                        Edit
                      </Link>
                      <DeleteBannerButton bannerId={banner.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}