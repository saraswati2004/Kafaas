export type ProductCategory = 
  | 'Fertilizers'
  | 'Pesticides'
  | 'Fungicides'
  | 'Herbicides'
  | 'Seeds'
  | 'Bio Products'
  | 'Crop Protection';

export type ProductForm = 'Liquid' | 'Granules' | 'Powder' | 'Emulsifiable Concentrate' | 'Soluble Powder' | 'Seeds Pack';

export type ProductStatus = 'active' | 'draft' | 'inactive' | 'out_of_stock' | 'discontinued';

export interface ProductSpecification {
  technicalName: string;
  chemicalFormula?: string;
  formulation: string;
  dosagePerAcre: string;
  dosagePerLiter: string;
  targetCrops: string[];
  targetPestsAndDiseases: string[];
  applicationMethod: string;
  waitingPeriodDays: number;
  toxicityClass: 'Green (Low)' | 'Blue (Moderate)' | 'Yellow (High)' | 'Red (Extremely Toxic)';
  manufacturer: string;
  countryOfOrigin: string;
  shelfLifeMonths: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  images: string[];
  mainImage: string;
  packSize: string; // e.g. "1 Litre", "500 ml", "5 Kg", "100 g"
  form: ProductForm;
  inStock: boolean;
  stockQuantity: number;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  isOrganic: boolean;
  recommendedForDiseases?: string[]; // IDs or names of diseases
  specifications: ProductSpecification;
  benefits: string[];
  usageInstructions: string[];
  safetyPrecautions: string[];
  vendorId?: string;
  vendorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilterParams {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  isOrganic?: boolean;
  organicOnly?: boolean; // deprecated - use isOrganic
  form?: string;
  crop?: string;
  targetCrop?: string; // deprecated - use crop
  diseaseId?: string;
  brand?: string;
  sortBy?: 'featured' | 'price_low_high' | 'price_high_low' | 'rating' | 'newest' | 'price_asc' | 'price_desc' | 'popular';
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryInfo {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string;
  iconName: string;
  imageUrl: string;
  productCount: number;
  popularBrands: string[];
}
