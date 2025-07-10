export interface Brand {
  name: string;
  slug: string;
  image: string; // Path to logo or image
}

export const brands: Brand[] = [
  {
    name: 'Lakme',
    slug: 'lakme',
    image: '/images/brands/lakme.avif',
  },
  {
    name: 'Joy',
    slug: 'joy',
    image: '/images/brands/joy.jpeg',
  },
  {
    name: 'Himalaya',
    slug: 'himalaya',
    image: '/images/brands/himalaya.png',
  },
  {
    name: 'L\'Oréal',
    slug: 'loreal',
    image: '/images/brands/loreal.png',
  },
  {
    name: 'Garnier',
    slug: 'garnier',
    image: '/images/brands/garnier.jpeg',
  },
  {
    name: 'Olay',
    slug: 'olay',
    image: '/images/brands/olay.jpeg',
  },
  {
    name: 'Nivea',
    slug: 'nivea',
    image: '/images/brands/nivea.png',
  },
  {
    name: 'Biotique',
    slug: 'biotique',
    image: '/images/brands/biotique.jpeg',
  },
  {
    name: 'Maybelline',
    slug: 'maybelline',
    image: '/images/brands/maybelline.png',
  }      
  
];