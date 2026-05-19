# AgraEcom - Modern E-commerce Platform

A full-featured e-commerce platform built with Next.js 15, featuring modern UI/UX, comprehensive admin management, and robust authentication system.

![AgraEcom Homepage](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/homepage.png)

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd akshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_mongodb_connection_string"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"
   
   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_upload_preset"
   
   # Email (Resend)
   RESEND_API_KEY="your_resend_api_key"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Screenshots

### Customer Experience
![Product Catalog](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/ProductSearch.png)
*Browse products with advanced filtering and search*

![Product Details](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/ProductDetail.png)
*Detailed product view with image gallery and offers*

![Shopping Cart](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/ShopCart.png)
*Intuitive cart management with quantity adjustments*

![Checkout Process](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/Checkout.png)
*Streamlined checkout with address management*

### Admin Dashboard
![Admin Dashboard](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/AdminDash.png)
*Comprehensive admin dashboard with analytics*

![Product Management](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/ProdManage.png)
*Advanced product management with bulk operations*

![Stock Management](https://raw.githubusercontent.com/Pratham2703005/AgraEcom/main/public/docs/StockManage.png)
*Real-time stock management with offer adjustments*


## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Image Management**: Cloudinary
- **Email**: Resend with React Email
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with Radix UI primitives

## Key Features

For detailed feature documentation, see [FEATURES.md](./FEATURES.md)

- **E-commerce Core**: Product catalog, cart, checkout, orders
- **User Management**: Authentication, profiles, email verification
- **Admin Panel**: Complete management dashboard
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System-aware theme switching
- **Email System**: Transactional emails with templates
- **Search & Filter**: Advanced product discovery
- **Analytics**: User and sales analytics
- **Brand Management**: Multi-brand support
- **Dynamic Offers**: Quantity-based pricing

## Project Structure

For detailed project structure, see [STRUCTURE.md](./STRUCTURE.md)

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
├── providers/          # Context providers
└── types/              # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Radix UI](https://radix-ui.com/) - Low-level UI primitives

---

**Built with ❤️ for modern e-commerce**
