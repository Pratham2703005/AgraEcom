# Profile Page Setup

This document provides instructions for setting up the user profile page functionality.

## Features Implemented

1. **Profile Information Management**
   - Update name, phone, address, and delivery address
   - View and update profile picture

2. **Phone Verification**
   - Firebase OTP verification for phone numbers
   - Status indicator showing verified/unverified status

3. **Image Upload**
   - Cloudinary integration for profile picture uploads
   - Image preview and validation

## Required Environment Variables

Add these to your `.env` file:

```
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-cloudinary-upload-preset"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
```

## Setup Instructions

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Phone Authentication in the Authentication section
   - Get your Firebase configuration from Project Settings > General > Your apps

2. **Create a Cloudinary Account**
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Create an upload preset in Settings > Upload > Upload presets
   - Make sure the upload preset is set to "Unsigned" for client-side uploads
   - Get your cloud name from Dashboard

3. **Run Prisma Migration**
   - After adding the new fields to the schema, run:
   ```
   npx prisma generate
   ```

4. **Access the Profile Page**
   - Navigate to `/profile` when logged in
   - The navbar already contains a link to the profile page

## Implementation Details

- **Database**: Added phone, phoneVerified, address, and deliveryAddress fields to the User model
- **Authentication**: Updated NextAuth types and callbacks to include the new fields
- **API Endpoints**: Created endpoints for updating profile and verifying phone
- **Components**: Created reusable components for phone verification and image upload
- **UI**: Responsive design with form validation and error handling 