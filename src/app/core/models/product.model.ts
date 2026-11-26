/** Shapes returned by https://dummyjson.com/docs/products */
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku?: string;
  thumbnail: string;
  images: string[];
  availabilityStatus?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: ProductReview[];
}

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}

export interface ProductPage {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type ProductSort = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface ProductQuery {
  search: string;
  category: string;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

/** The editable subset of a product used by the admin editor. */
export type ProductDraft = Pick<
  Product,
  'title' | 'description' | 'category' | 'brand' | 'price' | 'discountPercentage' | 'stock' | 'tags'
>;

export const EMPTY_PRODUCT_PAGE: ProductPage = { products: [], total: 0, skip: 0, limit: 0 };
