export interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  stock_quantity: number;
  featured?: boolean;
  best_seller?: boolean;
}

export const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Hydrating Rose Serum',
    price: 48,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1587&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1587&auto=format&fit=crop'],
    category: 'Serums',
    description: 'A lightweight, hydrating serum infused with rose extract and hyaluronic acid to deeply moisturize and soothe the skin.',
    featured: true,
    best_seller: true,
    stock_quantity: 100,
  },
  {
    id: '2',
    name: 'Vitamin C Brightening Moisturizer',
    price: 54,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70e758?q=80&w=1470&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70e758?q=80&w=1470&auto=format&fit=crop'],
    category: 'Moisturizers',
    description: 'A lightweight, antioxidant-rich moisturizer that brightens dull skin and protects against environmental stressors.',
    featured: true,
    stock_quantity: 80,
  },
  {
    id: '3',
    name: 'Gentle Enzyme Facial Cleanser',
    price: 36,
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1374&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1374&auto=format&fit=crop'],
    category: 'Cleansers',
    description: 'A gentle, sulfate-free cleanser that removes makeup and impurities while maintaining the natural moisture barrier.',
    featured: true,
    stock_quantity: 120,
  },
  {
    id: '4',
    name: 'Daily Protection SPF 50',
    price: 42,
    image: 'https://images.unsplash.com/photo-1525286116112-b59af11adad1?q=80&w=1780&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1525286116112-b59af11adad1?q=80&w=1780&auto=format&fit=crop'],
    category: 'Sunscreen',
    description: 'A lightweight, non-greasy sunscreen that protects against UVA/UVB rays while providing antioxidant benefits.',
    best_seller: true,
    stock_quantity: 150,
  }
];

import { normalizeImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from '../lib/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Fetch products from the backend database. If none are found or request fails, return defaultProducts.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    const formattedData = data.map((product: any) => {
      const rawImage = product.image;
      const rawImages = Array.isArray(product.images) ? product.images : (rawImage ? [rawImage] : []);
      const normalizedImages = rawImages.map((img: string) => normalizeImageUrl(img, DEFAULT_PLACEHOLDER_IMAGE));
      const normalizedImage = normalizeImageUrl(rawImage || (normalizedImages.length > 0 ? normalizedImages[0] : ''), DEFAULT_PLACEHOLDER_IMAGE);

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: normalizedImage,
        images: normalizedImages,
        category: product.category,
        description: product.description,
        stock_quantity: product.stock_quantity ?? 0,
        featured: Boolean(product.featured),
        best_seller: Boolean(product.best_seller),
      };
    });
    if (Array.isArray(formattedData) && formattedData.length > 0) {
      return formattedData;
    } else {
      return defaultProducts;
    }
  } catch (error) {
    return defaultProducts;
  }
}
