import { db } from '@/lib/db'

export async function getBanners() {
  try {
    const banners = await db.banner.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return banners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw new Error('Failed to fetch banners');
  }
}