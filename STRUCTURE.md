# 🏗️ AgraEcom Project Structure

This document provides a detailed overview of the project's architecture and file organization.

## 📁 Root Directory Structure

```
akshop/
├── .env.local                 # Environment variables (not in repo)
├── .env                       # Default environment variables
├── .gitignore                 # Git ignore rules
├── .vercelignore             # Vercel deployment ignore rules
├── eslint.config.mjs         # ESLint configuration
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies and scripts
├── postcss.config.mjs        # PostCSS configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Main documentation
├── FEATURES.md               # Feature documentation
├── STRUCTURE.md              # This file
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
└── src/                      # Source code
```

## 🎯 Source Code Architecture

### Overview
```
src/
├── app/                      # Next.js App Router (Pages & API)
├── components/               # Reusable UI components
├── lib/                      # Utilities and configurations
├── providers/                # React context providers
├── types/                    # TypeScript type definitions
└── emails/                   # Email templates
```

## 📱 App Router Structure (`src/app/`)

The application uses Next.js 15's App Router for routing and API endpoints.

```
app/
├── globals.css               # Global styles
├── layout.tsx                # Root layout component
├── loading.tsx               # Global loading component
├── not-found.tsx            # 404 page
├── page.tsx                 # Homepage
├── admin/                   # Admin dashboard routes
├── api/                     # API endpoints
├── cart/                    # Shopping cart pages
├── checkout/                # Checkout process
├── company/                 # Company information
├── help/                    # Help and support
├── login/                   # Authentication pages
├── orders/                  # Order management
├── products/                # Product catalog
├── profile/                 # User profile
├── register/                # User registration
├── verification-pending/    # Email verification
└── verify-email/           # Email verification handler
```

![App Structure](./docs/images/structure/app-structure.png)
*Next.js App Router structure visualization*

### Admin Dashboard (`src/app/admin/`)

Complete admin management system with dedicated routes:

```
admin/
├── page.tsx                 # Admin dashboard home
├── banners/                 # Banner management
│   ├── page.tsx            # Banner list
│   ├── new/                # Create banner
│   └── edit/[id]/          # Edit banner
├── brands/                  # Brand management
│   ├── new/                # Create brand
│   └── view-all/           # Brand list
├── orders/                  # Order management
│   ├── page.tsx            # Order list
│   └── [id]/               # Order details
├── products/                # Product management
│   ├── edit/[id]/          # Edit product
│   ├── new/                # Create product
│   ├── stock/              # Stock management
│   └── view-all/           # Product list
└── users/                   # User management
    ├── page.tsx            # User list
    └── analytics/          # User analytics
```

![Admin Structure](./docs/images/structure/admin-structure.png)
*Admin dashboard structure*

### API Routes (`src/app/api/`)

RESTful API endpoints for all application functionality:

```
api/
├── auth/                    # Authentication endpoints
│   ├── register/           # User registration
│   ├── verify-email/       # Email verification
│   └── reset-password/     # Password reset
├── admin/                   # Admin-only endpoints
│   ├── analytics/          # Analytics data
│   ├── banners/            # Banner CRUD
│   ├── brands/             # Brand CRUD
│   ├── orders/             # Order management
│   ├── products/           # Product CRUD
│   └── users/              # User management
├── products/                # Public product endpoints
│   ├── route.ts            # Product listing
│   ├── [id]/               # Product details
│   └── search/             # Product search
├── cart/                    # Shopping cart endpoints
├── orders/                  # Order endpoints
└── user/                    # User profile endpoints
```

## 🧩 Components Architecture (`src/components/`)

Reusable UI components organized by functionality:

```
components/
├── ui/                      # Base UI components (Radix UI based)
│   ├── button.tsx          # Button component
│   ├── input.tsx           # Input component
│   ├── modal.tsx           # Modal component
│   ├── toast.tsx           # Toast notifications
│   └── ...                 # Other UI primitives
├── BannerSlider.tsx         # Homepage banner slider
├── BrandSection.tsx         # Brand showcase
├── CustomLoader.tsx         # Loading components
├── Footer.tsx               # Site footer
├── ImageUpload.tsx          # Image upload component
├── Navbar.tsx               # Navigation bar
├── OfflineDetector.tsx      # Offline status detector
├── SearchInput.tsx          # Search functionality
└── ThemeToggle.tsx          # Dark/light mode toggle
```

![Components Structure](./docs/images/structure/components-structure.png)
*Component hierarchy and relationships*

### UI Components (`src/components/ui/`)

Base components built on Radix UI primitives:

```
ui/
├── button.tsx               # Customizable button component
├── input.tsx                # Form input component
├── label.tsx                # Form label component
├── checkbox.tsx             # Checkbox component
├── tabs.tsx                 # Tab navigation component
├── modal.tsx                # Modal dialog component
├── toast.tsx                # Toast notification system
├── skeleton.tsx             # Loading skeleton component
└── ...                      # Additional UI primitives
```

## 🛠️ Utilities & Configuration (`src/lib/`)

Core utilities and configuration files:

```
lib/
├── auth.ts                  # NextAuth.js configuration
├── auth-utils.ts            # Authentication utilities
├── cloudinary.ts            # Cloudinary image upload
├── db.ts                    # Prisma database client
├── email.ts                 # Email service (Resend)
├── hooks.ts                 # Custom React hooks
├── session.ts               # Session management
├── theme.ts                 # Theme configuration
├── useOffline.ts            # Offline detection hook
└── utils.ts                 # General utilities
```

![Lib Structure](./docs/images/structure/lib-structure.png)
*Library and utilities organization*

### Key Utility Files

#### Database (`lib/db.ts`)
```typescript
// Prisma client configuration
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()
```

#### Authentication (`lib/auth.ts`)
```typescript
// NextAuth.js configuration with Prisma adapter
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
// ... configuration
```

## 🔄 State Management (`src/providers/`)

React context providers for global state:

```
providers/
├── auth-provider.tsx        # Authentication context
└── offline-provider.tsx     # Offline status context
```

### Authentication Provider
Manages user authentication state across the application:

```typescript
// Provides user session and authentication methods
export const AuthProvider = ({ children }) => {
  // Session management logic
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}
```

## 📝 Type Definitions (`src/types/`)

TypeScript type definitions for type safety:

```
types/
├── next-auth.d.ts           # NextAuth.js type extensions
└── index.ts                 # Global type definitions
```

### Database Types
Generated automatically by Prisma:

```typescript
// Auto-generated from Prisma schema
export type User = {
  id: string
  name: string | null
  email: string
  role: Role
  // ... other fields
}

export type Product = {
  id: string
  name: string
  mrp: number
  offers: Json
  // ... other fields
}
```

## 📧 Email Templates (`src/emails/`)

React Email templates for transactional emails:

```
emails/
└── verification-email.tsx   # Email verification template
```

![Email Template](./docs/images/structure/email-template.png)
*Email template structure*

## 🗄️ Database Schema (`prisma/`)

Database schema and configuration:

```
prisma/
└── schema.prisma            # Database schema definition
```

### Key Models

#### User Model
```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String    @unique
  emailVerified DateTime?
  isVerified    Boolean   @default(false)
  role          Role      @default(CUSTOMER)
  // ... relationships and other fields
}
```

#### Product Model
```prisma
model Product {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  mrp         Float
  offers      Json        @default("{\"1\": 0}")
  images      String[]
  brandId     String?     @db.ObjectId
  brand       Brand?      @relation(fields: [brandId], references: [id])
  // ... other fields and indexes
}
```

![Database Schema](./docs/images/structure/database-schema.png)
*Database relationships and structure*

## 🎨 Styling Architecture

### Tailwind CSS Configuration
```typescript
// tailwind.config.ts
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

### Global Styles
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables for theming */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other CSS variables */
}
```

## 🔧 Configuration Files

### Next.js Configuration
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    serverActions: true,
  },
}
```

### ESLint Configuration
```javascript
// eslint.config.mjs
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    rules: {
      // Custom linting rules
    },
  },
]
```

## 📦 Build & Deployment Structure

### Build Process
```bash
# Build command in package.json
"build": "npx prisma generate && next build"
```

### Deployment Structure
```
.next/                       # Next.js build output
├── static/                  # Static assets
├── server/                  # Server-side code
└── cache/                   # Build cache
```

## 🔍 Development Workflow

### File Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Pages**: kebab-case (e.g., `product-details.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Types**: PascalCase (e.g., `UserProfile.ts`)

### Import Organization
```typescript
// External libraries
import React from 'react'
import { NextPage } from 'next'

// Internal components
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'

// Utilities and types
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
```

## 📊 Performance Considerations

### Code Splitting
- Automatic route-based splitting with App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Image Optimization
- Next.js Image component for automatic optimization
- Cloudinary for advanced image transformations
- WebP format support with fallbacks

### Bundle Analysis
```bash
# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

![Bundle Analysis](./docs/images/structure/bundle-analysis.png)
*Bundle size analysis and optimization*

## 🚀 Scalability Architecture

### Horizontal Scaling
- Stateless server design
- Database connection pooling
- CDN integration for static assets

### Vertical Scaling
- Efficient database queries with indexes
- Caching strategies at multiple levels
- Optimized component rendering

### Monitoring & Observability
- Error tracking integration points
- Performance monitoring hooks
- Analytics event tracking

---

*This structure documentation is maintained alongside code changes to ensure accuracy.*