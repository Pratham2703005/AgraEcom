"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

interface DeleteBannerButtonProps {
  bannerId: string;
}

export default function DeleteBannerButton({ bannerId }: DeleteBannerButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/banner/${bannerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete banner");
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert(err instanceof Error ? err.message : "An unknown error occurred while deleting the banner");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 inline-flex items-center disabled:opacity-50"
    >
      {isDeleting ? (
        <span className="flex items-center">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></span>
          Deleting...
        </span>
      ) : (
        <>
          <Trash2Icon className="size-4 mr-1" />
          Delete
        </>
      )}
    </button>
  );
}