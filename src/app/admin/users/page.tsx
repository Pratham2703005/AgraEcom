"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Users, 
  Search, 
  Filter,
  Edit, 
  Trash2, 
  Shield, 
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowUpDown
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: "ADMIN" | "CUSTOMER";
  isVerified: boolean;
  emailVerified: Date | null;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  _count: {
    orders: number;
  };
}

interface UserResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  roleStats: {
    ADMIN: number;
    CUSTOMER: number;
  };
}

export default function ManageUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleStats, setRoleStats] = useState({ ADMIN: 0, CUSTOMER: 0 });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (page = 1, search = "", role = "", sort = sortBy, order = sortOrder) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        sortBy: sort,
        sortOrder: order,
      });

      if (role) {
        params.append("role", role);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data: UserResponse = await response.json();
        setUsers(data.users);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.totalUsers);
        setRoleStats(data.roleStats);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
    
    // Get role filter from URL params
    const roleParam = searchParams.get("role");
    if (roleParam) {
      setRoleFilter(roleParam.toUpperCase());
    }
    
    fetchUsers(1, "", roleParam || "");
  }, [session, router, searchParams]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchUsers(1, searchTerm, roleFilter);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, roleFilter]);

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    fetchUsers(currentPage, searchTerm, roleFilter, field, newOrder);
  };

  const handleRoleChange = async (newRole: "ADMIN" | "CUSTOMER") => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await fetchUsers(currentPage, searchTerm, roleFilter);
        setShowRoleModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers(currentPage, searchTerm, roleFilter);
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setActionLoading(false);
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Manage Users</h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                View and manage all users in your system
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Users</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{totalUsers}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 mr-4">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Customers</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{roleStats.CUSTOMER}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Admins</p>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{roleStats.ADMIN}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                >
                  <option value="">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center space-x-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <span>Name</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center space-x-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <span>Email</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center space-x-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <span>Role</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="flex items-center space-x-1 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <span>Created At</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.image ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.image}
                                alt={user.name || "User"}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                                <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                              {user.name || "No name"}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {user._count.orders} orders
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                          <span className="text-sm text-neutral-900 dark:text-white">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {user.role === "ADMIN" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {user.phone || "Not provided"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.isVerified && user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {user.isVerified && user.emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-neutral-400 mr-2" />
                          <span className="text-sm text-neutral-900 dark:text-white">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Change Role"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.id !== session.user?.id && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-neutral-800 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchUsers(currentPage - 1, searchTerm, roleFilter)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(currentPage + 1, searchTerm, roleFilter)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-sm font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      Showing{" "}
                      <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, totalUsers)}
                      </span>{" "}
                      of <span className="font-medium">{totalUsers}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => fetchUsers(currentPage - 1, searchTerm, roleFilter)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchUsers(page, searchTerm, roleFilter)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400"
                              : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-600"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => fetchUsers(currentPage + 1, searchTerm, roleFilter)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                Change User Role
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Change role for <strong>{selectedUser.name || selectedUser.email}</strong>
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleRoleChange("CUSTOMER")}
                  disabled={actionLoading || selectedUser.role === "CUSTOMER"}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Make Customer
                </button>
                <button
                  onClick={() => handleRoleChange("ADMIN")}
                  disabled={actionLoading || selectedUser.role === "ADMIN"}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Make Admin
                </button>
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">
                Delete User
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete <strong>{selectedUser.name || selectedUser.email}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}