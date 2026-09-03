import { apiClient, API_BASE_URL, mockDelay } from './client';
import { Product, PaginatedProducts, ProductFilterParams, CategoryInfo } from '../types/product.types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mockData';

// In-memory editable store for local interactions
let localProducts = [...MOCK_PRODUCTS];

export const productsApi = {
  getProducts: async (params: ProductFilterParams = {}): Promise<PaginatedProducts> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<PaginatedProducts>('/products', { params });
      return res.data;
    }
    await mockDelay(300);

    let filtered = [...localProducts];

    // Filter by Category
    if (params.category) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    // Search query
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.specifications.technicalName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.specifications.targetCrops.some((c) => c.toLowerCase().includes(q)) ||
          p.specifications.targetPestsAndDiseases.some((d) => d.toLowerCase().includes(q))
      );
    }

    // In stock filter
    if (params.inStockOnly) {
      filtered = filtered.filter((p) => p.inStock && p.stockQuantity > 0);
    }

    // Organic filter
    if (params.isOrganic || params.organicOnly) {
      filtered = filtered.filter((p) => p.isOrganic);
    }

    // Form filter
    if (params.form) {
      filtered = filtered.filter((p) => p.form.toLowerCase() === params.form?.toLowerCase());
    }

    // Target Crop filter
    const targetCrop = params.crop || params.targetCrop;
    if (targetCrop) {
      filtered = filtered.filter((p) =>
        p.specifications.targetCrops.some((c) => c.toLowerCase().includes(targetCrop.toLowerCase()))
      );
    }
    // Disease ID filter
    if (params.diseaseId) {
      filtered = filtered.filter((p) => p.recommendedForDiseases?.includes(params.diseaseId!));
    }

    // Price filters
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= params.maxPrice!);
    }

    // Sorting
    if (params.sortBy) {
      const sortBy = params.sortBy === 'price_asc' ? 'price_low_high'
        : params.sortBy === 'price_desc' ? 'price_high_low'
        : params.sortBy === 'popular' ? 'rating'
        : params.sortBy;
      switch (sortBy) {
        case 'price_low_high':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high_low':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Product>(`/products/${id}`);
      return res.data;
    }
    await mockDelay(200);
    const product = localProducts.find((p) => p.id === id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  },

  getCategories: async (): Promise<CategoryInfo[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<CategoryInfo[]>('/categories');
      return res.data;
    }
    await mockDelay(150);
    return MOCK_CATEGORIES;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Product[]>('/products/featured');
      return res.data;
    }
    await mockDelay(250);
    return localProducts.slice(0, 8);
  },

  getRelatedProducts: async (productId: string): Promise<Product[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Product[]>(`/products/${productId}/related`);
      return res.data;
    }
    await mockDelay(200);
    const current = localProducts.find((p) => p.id === productId);
    if (!current) return localProducts.slice(0, 4);
    return localProducts
      .filter((p) => p.id !== productId && p.category === current.category)
      .slice(0, 4);
  },

  // Admin Operations
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<Product>('/admin/products', data);
      return res.data;
    }
    await mockDelay(400);
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name || 'New Agro Product',
      brand: data.brand || 'Generic Agri',
      category: data.category || 'Fertilizers',
      sku: data.sku || `SKU-${Date.now()}`,
      description: data.description || 'Agricultural input product.',
      shortDescription: data.shortDescription || 'Certified crop care solution.',
      price: Number(data.price) || 500,
      originalPrice: Number(data.originalPrice) || Number(data.price) || 550,
      discountPercentage: data.discountPercentage || 10,
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80'],
      mainImage: data.mainImage || 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
      packSize: data.packSize || '1 Litre',
      form: data.form || 'Liquid',
      inStock: data.inStock ?? true,
      stockQuantity: Number(data.stockQuantity) || 50,
      status: data.status || 'active',
      rating: 5.0,
      reviewCount: 1,
      isOrganic: data.isOrganic ?? false,
      recommendedForDiseases: data.recommendedForDiseases || [],
      specifications: data.specifications || {
        technicalName: 'Active Chemical / Bio Ingredient',
        formulation: 'Standard Grade',
        dosagePerAcre: '250ml - 500ml in 200L water',
        dosagePerLiter: '2ml / Litre',
        targetCrops: ['Tomato', 'Paddy', 'Cotton'],
        targetPestsAndDiseases: ['General pests and diseases'],
        applicationMethod: 'Foliar Spray',
        waitingPeriodDays: 14,
        toxicityClass: 'Green (Low)',
        manufacturer: 'Certified Agro Chemicals',
        countryOfOrigin: 'India',
        shelfLifeMonths: 24,
      },
      benefits: data.benefits || ['Increases crop resilience', 'Cost-effective yield protection'],
      usageInstructions: data.usageInstructions || ['Spray during early morning hours.'],
      safetyPrecautions: data.safetyPrecautions || ['Wear gloves and face mask.'],
      vendorId: data.vendorId || 'ven-1',
      vendorName: data.vendorName || 'AgroTech Solutions Indore',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localProducts = [newProduct, ...localProducts];
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (API_BASE_URL) {
      const res = await apiClient.put<Product>(`/admin/products/${id}`, updates);
      return res.data;
    }
    await mockDelay(300);
    const index = localProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    localProducts[index] = {
      ...localProducts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localProducts[index];
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    if (API_BASE_URL) {
      const res = await apiClient.delete<{ success: boolean }>(`/admin/products/${id}`);
      return res.data;
    }
    await mockDelay(300);
    localProducts = localProducts.filter((p) => p.id !== id);
    return { success: true };
  }
};
