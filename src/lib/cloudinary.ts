/**
 * Uploads an image to Cloudinary and returns the URL
 * @param file - The file to upload
 * @returns The URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
   const CLOUDINARY_UPLOAD_PRESET = "akshop_products";
   const CLOUDINARY_CLOUD_NAME = "dxaymasp1";
  try {
    // Create form data for the upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 