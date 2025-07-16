"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PlusIcon } from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Define Brand type
type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

// Product type as it comes from Prisma
type Product = {
  id: string;
  brandId?: string | null;
  brand?: Brand | null;
  name: string;
  weight?: string | null;
  mrp: number;
  discount: number;
  price: number;
  demand?: number | null;
  description?: string | null;
  piecesLeft?: number | null;
  images: string[];
};

export default function EditProductForm({ product }: { product: Product }) {
  const [brandId, setBrandId] = useState(product.brandId || "");
  const [name, setName] = useState(product.name || "");
  const [weight, setWeight] = useState(product.weight || "");
  const [mrp, setMrp] = useState(product.mrp?.toString() || "");
  const [discount, setDiscount] = useState(product.discount?.toString() || "");
  const [price, setPrice] = useState(product.price?.toString() || "");
  const [demand, setDemand] = useState(product.demand?.toString() || "");
  const [description, setDescription] = useState(product.description || "");
  const [piecesLeft, setPiecesLeft] = useState(product.piecesLeft?.toString() || "");
  const [images, setImages] = useState<string[]>(product.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [lastEdited, setLastEdited] = useState<"mrp" | "discount" | "price" | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [urlUploading, setUrlUploading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoadingBrands(true);
        const response = await fetch('/api/brands');
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setError('Failed to load brands. Please try again later.');
      } finally {
        setLoadingBrands(false);
      }
    };
    
    fetchBrands();
  }, []);

  useEffect(() => {
    if (lastEdited === "mrp" || lastEdited === "discount") {
      if (mrp && discount) {
        const mrpVal = parseFloat(mrp);
        const discountVal = parseFloat(discount);
        if (!isNaN(mrpVal) && !isNaN(discountVal)) {
          setPrice(((mrpVal * (1 - discountVal / 100)).toFixed(2)));
        }
      }
    } else if (lastEdited === "price") {
      if (mrp && price) {
        const mrpVal = parseFloat(mrp);
        const priceVal = parseFloat(price);
        if (!isNaN(mrpVal) && !isNaN(priceVal) && mrpVal !== 0) {
          setDiscount(((100 * (1 - priceVal / mrpVal)).toFixed(2)));
        }
      }
    }
  }, [mrp, discount, price, lastEdited]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          setError("Failed to upload image");
        }
      } catch {
        setError("Failed to upload image");
      }
    }
    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) return;
    
    setUrlUploading(true);
    setError("");
    
    try {
      // Upload to Cloudinary using the URL
      const formData = new FormData();
      formData.append("file", imageUrl);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET || "");
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.secure_url) {
        setImages((prev) => [...prev, data.secure_url]);
        setImageUrl(""); // Clear the input field after successful upload
      } else {
        setError("Failed to upload image from URL");
      }
    } catch (error) {
      console.error("Error uploading image from URL:", error);
      setError("Failed to upload image from URL. Make sure the URL is accessible and points to a valid image.");
    } finally {
      setUrlUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    const productData = {
      brandId,
      name,
      weight,
      mrp: mrp ? parseFloat(mrp) : undefined,
      discount: discount ? parseFloat(discount) : undefined,
      price: price ? parseFloat(price) : undefined,
      demand: demand ? parseFloat(demand) : undefined,
      description,
      piecesLeft: piecesLeft ? parseInt(piecesLeft, 10) : undefined,
      images,
    };
    try {
      const response = await fetch(`/api/admin/product/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
      }
      
      setSuccess("Product updated successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-green-700 dark:text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">Product Images</h2>
            
            {/* Image Upload from URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Upload Image from URL
              </label>
              <div className="flex">
                <input
                  type="url"
                  className="flex-1 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={urlUploading}
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  onClick={handleUrlUpload}
                  disabled={!imageUrl || urlUploading}
                >
                  {urlUploading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <PlusIcon className="w-4 h-4" />
                      <span>Add</span>
                    </div>
                  )}
                </button>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Enter an image URL and click Add to upload
              </p>
            </div>
            
            {/* Traditional File Upload Area */}
            <div className="mb-6">
              <div
                className="w-full h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-400 text-6xl relative transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <span>+</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-neutral-800 bg-opacity-90 text-base rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                Click to upload product images (you can select multiple)
              </p>
            </div>
            
            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Uploaded Images</h3>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700 group">
                      <div className="relative w-full h-full">
                        <Image src={url} alt={`Product ${index + 1}`} fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover" />
                      </div>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Product Details */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-neutral-900 dark:text-white">Product Details</h2>
            
            <div className="space-y-6">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Brand *
                </label>
                <select
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  required
                  disabled={loadingBrands}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {loadingBrands && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Loading brands...
                  </p>
                )}
              </div>
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="e.g. Hydrating Face Wash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              {/* Weight/Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Weight/Size
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="e.g. 100ml, 50g"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              
              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                    placeholder="0.00"
                    value={mrp}
                    onChange={(e) => {
                      setMrp(e.target.value);
                      setLastEdited("mrp");
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                    placeholder="0"
                    value={discount}
                    onChange={(e) => {
                      setDiscount(e.target.value);
                      setLastEdited("discount");
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setLastEdited("price");
                    }}
                    required
                  />
                </div>
              </div>
              
              {/* Inventory */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="0"
                  value={piecesLeft}
                  onChange={(e) => setPiecesLeft(e.target.value)}
                />
              </div>
              
              {/* Demand Score */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Demand Score (0-1)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                  placeholder="0"
                  value={demand}
                  onChange={(e) => setDemand(e.target.value)}
                />
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Higher values will prioritize this product in listings (0 = lowest, 1 = highest)
                </p>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white min-h-[120px]"
                  placeholder="Enter product description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting || uploading || urlUploading}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Product...
                    </div>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}