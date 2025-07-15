
export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  howToUse: string;
  stock_quantity: number;
  featured?: boolean;
  bestSeller?: boolean;
}

export const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Hydrating Rose Serum',
    price: 48,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'serum',
    description: 'A lightweight, hydrating serum infused with rose extract and hyaluronic acid to deeply moisturize and soothe the skin.',
    benefits: [
      'Provides deep hydration',
      'Soothes and calms irritated skin',
      'Reduces redness',
      'Improves skin texture'
    ],
    ingredients: [
      'Rose Extract',
      'Hyaluronic Acid',
      'Glycerin',
      'Aloe Vera',
      'Vitamin E'
    ],
    howToUse: 'Apply 2-3 drops to clean, dry skin morning and evening. Follow with moisturizer.',
    featured: true,
    bestSeller: true
  },
  {
    id: '2',
    name: 'Vitamin C Brightening Moisturizer',
    price: 54,
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70e758?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'moisturizer',
    description: 'A lightweight, antioxidant-rich moisturizer that brightens dull skin and protects against environmental stressors.',
    benefits: [
      'Brightens dull complexion',
      'Reduces dark spots and hyperpigmentation',
      'Protects against free radicals',
      'Improves skin firmness'
    ],
    ingredients: [
      'Vitamin C (10% L-Ascorbic Acid)',
      'Vitamin E',
      'Ferulic Acid',
      'Jojoba Oil',
      'Shea Butter'
    ],
    howToUse: 'Apply to clean face and neck every morning, after serums and before sunscreen.',
    featured: true
  },
  {
    id: '3',
    name: 'Gentle Enzyme Facial Cleanser',
    price: 36,
    image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'cleanser',
    description: 'A gentle, sulfate-free cleanser that removes makeup and impurities while maintaining the skin\'s natural moisture barrier.',
    benefits: [
      'Removes makeup and impurities without stripping',
      'Maintains skin\'s natural pH balance',
      'Gently exfoliates with fruit enzymes',
      'Suitable for sensitive skin'
    ],
    ingredients: [
      'Papain (Papaya Enzyme)',
      'Bromelain (Pineapple Enzyme)',
      'Aloe Vera',
      'Chamomile Extract',
      'Green Tea Extract'
    ],
    howToUse: 'Massage onto damp skin, rinse thoroughly with warm water. Use morning and evening.',
    featured: true
  },
  {
    id: '4',
    name: 'Overnight Renewal Mask',
    price: 58,
    image: 'https://images.unsplash.com/photo-1614806687394-7cd6c68d2025?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'mask',
    description: 'A rich overnight mask that repairs and rejuvenates skin while you sleep, featuring retinol and peptides.',
    benefits: [
      'Boosts collagen production',
      'Reduces fine lines and wrinkles',
      'Improves skin elasticity',
      'Leaves skin plump and radiant'
    ],
    ingredients: [
      'Retinol',
      'Peptide Complex',
      'Niacinamide',
      'Squalane',
      'Ceramides'
    ],
    howToUse: 'Apply a generous layer to clean skin 2-3 times per week. Leave on overnight and rinse in the morning.',
    featured: true,
    bestSeller: true
  },
  {
    id: '5',
    name: 'Soothing Aloe Gel Moisturizer',
    price: 42,
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'moisturizer',
    description: 'A lightweight gel moisturizer that calms and hydrates sensitive or irritated skin.',
    benefits: [
      'Instantly soothes irritated skin',
      'Provides oil-free hydration',
      'Reduces redness and inflammation',
      'Cooling sensation'
    ],
    ingredients: [
      'Aloe Vera',
      'Cucumber Extract',
      'Centella Asiatica',
      'Allantoin',
      'Hyaluronic Acid'
    ],
    howToUse: 'Apply to clean face and neck morning and evening. Perfect for use after sun exposure or skin treatments.'
  },
  {
    id: '6',
    name: 'AHA/BHA Exfoliating Toner',
    price: 38,
    image: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?q=80&w=1452&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'toner',
    description: 'A gentle exfoliating toner with alpha and beta hydroxy acids to remove dead skin cells and unclog pores.',
    benefits: [
      'Unclogs pores and prevents breakouts',
      'Smooths skin texture',
      'Reduces appearance of pores',
      'Prepares skin for better absorption of serums'
    ],
    ingredients: [
      'Glycolic Acid (AHA)',
      'Salicylic Acid (BHA)',
      'Lactic Acid',
      'Witch Hazel',
      'Rose Water'
    ],
    howToUse: 'Apply to clean skin with a cotton pad, avoiding the eye area. Use 2-3 times per week, gradually increasing frequency as tolerated.',
    bestSeller: true
  },
  {
    id: '7',
    name: 'Nourishing Eye Cream',
    price: 46,
    image: 'https://images.unsplash.com/photo-1629732678763-b769a9098ac8?q=80&w=2068&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'eye care',
    description: 'A rich eye cream that targets dark circles, puffiness, and fine lines around the delicate eye area.',
    benefits: [
      'Reduces dark circles and puffiness',
      'Smooths fine lines and wrinkles',
      'Hydrates delicate eye area',
      'Brightens and firms'
    ],
    ingredients: [
      'Caffeine',
      'Peptides',
      'Vitamin K',
      'Hyaluronic Acid',
      'Shea Butter'
    ],
    howToUse: 'Apply a small amount using ring finger. Gently pat around orbital bone morning and evening.',
    bestSeller: true
  },
  {
    id: '8',
    name: 'Daily Protection SPF 50',
    price: 42,
    image: 'https://images.unsplash.com/photo-1525286116112-b59af11adad1?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'sunscreen',
    description: 'A lightweight, non-greasy sunscreen that protects against UVA/UVB rays while providing antioxidant benefits.',
    benefits: [
      'Broad-spectrum SPF 50 protection',
      'Lightweight, non-greasy formula',
      'Protects against blue light damage',
      'Antioxidant protection'
    ],
    ingredients: [
      'Zinc Oxide',
      'Titanium Dioxide',
      'Vitamin E',
      'Niacinamide',
      'Green Tea Extract'
    ],
    howToUse: 'Apply generously to face and neck as the final step in your morning skincare routine. Reapply every 2 hours when exposed to sun.',
    bestSeller: true
  }
];

/**
 * Fetch products from the backend database. If none are found or request fails, return defaultProducts.
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    } else {
      return defaultProducts;
    }
  } catch (error) {
    // Fallback to default products on error
    return defaultProducts;
  }
}
