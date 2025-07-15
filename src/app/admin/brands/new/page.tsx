"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

// TODO: Replace with your actual Cloudinary upload preset and cloud name
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function NewBrandPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    redirect("/login");
  }
  
  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Generate slug - convert to lowercase, replace spaces with hyphens, remove special chars
    const newSlug = newName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    
    setSlug(newSlug);
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
  };
  
  // Upload image to Cloudinary
  const uploadImage = async (): Promise<string> => {
    if (!imageFile && !imageUrl) {
      throw new Error("No image selected or URL provided");
    }
    
    setIsUploading(true);
    
    try {
      // If we have a direct URL to an image, upload it to Cloudinary
      if (imageUrl && !imageFile) {
        const formData = new FormData();
        formData.append("file", imageUrl);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error("Failed to upload image from URL");
        }
        
        const data = await res.json();
        return data.secure_url;
      }
      
      // If we have a file, upload it directly
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error("Failed to upload image");
        }
        
        const data = await res.json();
        return data.secure_url;
      }
      
      throw new Error("No image to upload");
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !slug) {
      setError("Name and slug are required");
      return;
    }
    
    if (!imageFile && !imageUrl) {
      setError("Please upload a brand logo");
      return;
    }
    
    try {
      // If we have a file, upload it first
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }
      
      // Create the brand
      const response = await fetch("/api/admin/brand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          imageUrl: finalImageUrl,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create brand");
      }
      
      // Redirect to the brands list
      router.push("/admin/brands/view-all");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error creating brand";
      setError(errorMessage);
      console.error(err);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="size-8 mr-2" />
            
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">Add New Brand</h1>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  placeholder="e.g. Lakme"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                  placeholder="e.g. lakme"
                  required
                />
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Used for URLs. Auto-generated from name, but you can edit it.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Brand Logo
                </label>
                
                {imagePreview ? (
                  <div className="relative w-40 h-40 border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Brand logo preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-neutral-300 dark:border-neutral-600 border-dashed rounded-lg cursor-pointer bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-neutral-400" />
                        <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          PNG, JPG or JPEG (recommended size: 200x200px)
                        </p>
                      </div>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                )}
                
                <div className="mt-4">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Or enter image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value) {
                        setImagePreview(e.target.value);
                      } else if (!imageFile) {
                        setImagePreview(null);
                      }
                    }}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                    isUploading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploading ? "Uploading..." : "Add Brand"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 