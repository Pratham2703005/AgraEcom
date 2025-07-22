"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  TrendingUp, 
  Shield, 
  User,
  CheckCircle,
  XCircle
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  adminUsers: number;
  customerUsers: number;
  usersWithOrders: number;
  usersWithoutOrders: number;
  monthlyGrowth: {
    month: string;
    count: number;
  }[];
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    isVerified: boolean;
  }[];
}

export default function UserAnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchAnalytics();
  }, [session, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">Failed to load analytics data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">User Analytics</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Insights and statistics about your users
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Users</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{analytics.totalUsers}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mr-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">New This Month</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{analytics.newUsersThisMonth}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Verified Users</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{analytics.verifiedUsers}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 mr-4">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Unverified Users</p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{analytics.unverifiedUsers}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Role Distribution and User Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Role Distribution */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Role Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-neutral-700 dark:text-neutral-300">Admins</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-neutral-900 dark:text-white mr-2">
                    {analytics.adminUsers}
                  </span>
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(analytics.adminUsers / analytics.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-neutral-700 dark:text-neutral-300">Customers</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-neutral-900 dark:text-white mr-2">
                    {analytics.customerUsers}
                  </span>
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(analytics.customerUsers / analytics.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">User Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">Users with Orders</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-neutral-900 dark:text-white mr-2">
                    {analytics.usersWithOrders}
                  </span>
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(analytics.usersWithOrders / analytics.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-neutral-400 rounded-full mr-2"></div>
                  <span className="text-neutral-700 dark:text-neutral-300">Users without Orders</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-neutral-900 dark:text-white mr-2">
                    {analytics.usersWithoutOrders}
                  </span>
                  <div className="w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-neutral-400 h-2 rounded-full" 
                      style={{ width: `${(analytics.usersWithoutOrders / analytics.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Growth Chart */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Monthly User Growth</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {analytics.monthlyGrowth.map((month, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {month.count}
                  </div>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {month.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Name</th>
                  <th className="text-left py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</th>
                  <th className="text-left py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Role</th>
                  <th className="text-left py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Status</th>
                  <th className="text-left py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">Joined</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-700">
                    <td className="py-3">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {user.name || "No name"}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        {user.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}