"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImage: string | null;
  onImageUploaded: (imageUrl: string) => void;
  variant?: 'round' | 'rectangular';
  aspectRatio?: string;
  width?: string;
  height?: string;
}

export default function ImageUpload({ 
  currentImage, 
  onImageUploaded, 
  variant = 'round',
  aspectRatio = 'aspect-square',
  width = 'w-40',
  height = 'h-40'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      
      if (imageUrl) {
        onImageUploaded(imageUrl);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      // Revert to previous image
      setPreviewImage(currentImage);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setPreviewImage(null);
    onImageUploaded('');
  };
  
  const containerClasses = `${width} ${height} ${aspectRatio} overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative ${
    variant === 'round' ? 'rounded-full' : 'rounded-md'
  }`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4 w-full">
        <div className={containerClasses}>
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : null}
          
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Uploaded image"
              fill
              sizes={variant === 'round' ? "160px" : "100vw"}
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-16 w-16 text-neutral-400" />
            </div>
          )}
        </div>
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
        />
        
        <div className="absolute bottom-0 right-0">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="rounded-full h-10 w-10 shadow-md"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            <Upload className="h-5 w-5" />
          </Button>
        </div>
        
        {previewImage && (
          <div className="absolute bottom-0 left-0">
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="rounded-full h-10 w-10 shadow-md"
              onClick={removeImage}
              disabled={isUploading}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 