# Environment Setup

This document outlines the environment variables required for this application.

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_mongodb_connection_string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Resend (for email)
RESEND_API_KEY="your_resend_api_key"
```

## How to get these values

### MongoDB
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. In the "Database" section, click "Connect" and select "Connect your application"
4. Copy the connection string and replace `<password>` with your database user password

### NextAuth
1. Generate a secure random string for NEXTAUTH_SECRET using `openssl rand -base64 32` in your terminal
2. For development, NEXTAUTH_URL should be "http://localhost:3000"

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set up the OAuth consent screen
6. Create a Web application type
7. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copy the Client ID and Client Secret

### Cloudinary
1. Create an account at [Cloudinary](https://cloudinary.com/)
2. Navigate to the Dashboard
3. Copy the Cloud name, API Key, and API Secret

### Resend
1. Create an account at [Resend](https://resend.com/)
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key value 