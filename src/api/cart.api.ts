import { apiClient, API_BASE_URL, mockDelay } from './client';
import { Product } from '../types/product.types';
import { OrderPricing } from '../types/order.types';
import { productsApi } from './products.api';

export interface CartCalculationRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
  kisanSubsidyApplied?: boolean;
}

export interface CartValidationResult {
  isValid: boolean;
  pricing: OrderPricing;
  itemDetails: {
    product: Product;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
    isStockAvailable: boolean;
    availableStock: number;
    stockWarning?: string;
  }[];
  appliedDiscounts: string[];
}

export const cartApi = {
  calculateTotals: async (req: CartCalculationRequest): Promise<CartValidationResult> => {
    console.log('[cartApi] calculateTotals called with:', req);
    if (API_BASE_URL) {
      const res = await apiClient.post<any>('/cart/calculate', req);
      console.log('[cartApi] raw response:', res.data);
      
      // Transform backend response to frontend format
      // Note: response interceptor already converts snake_case to camelCase
      const backendData: any = res.data;
      const transformedData: CartValidationResult = {
        isValid: backendData.allItemsInStock && backendData.items.every((item: any) => item.inStock),
        pricing: {
          subtotal: backendData.subtotal,
          discount: backendData.discount,
          farmerSubsidyDiscount: backendData.farmerSubsidyDiscount,
          deliveryCharge: backendData.deliveryCharge,
          taxGst: backendData.taxGst,
          totalAmount: backendData.totalAmount,
        },
        itemDetails: backendData.items.map((item: any) => ({
          product: {
            id: item.productId,
            name: item.productName,
            brand: item.brand,
            category: item.category,
            sku: item.sku,
            description: '',
            shortDescription: '',
            price: item.unitPrice,
            originalPrice: item.unitPrice,
            discountPercentage: 0,
            images: [item.image],
            mainImage: item.image,
            packSize: item.packSize,
            form: item.form || 'Unknown',
            inStock: item.inStock,
            stockQuantity: item.availableStock,
            status: 'active',
            rating: 0,
            reviewCount: 0,
            isOrganic: false,
            specifications: {
              technicalName: '',
              formulation: '',
              dosagePerAcre: '',
              dosagePerLiter: '',
              targetCrops: [],
              targetPestsAndDiseases: [],
              applicationMethod: '',
              waitingPeriodDays: 0,
              toxicityClass: 'Green (Low)',
              manufacturer: '',
              countryOfOrigin: '',
              shelfLifeMonths: 0,
            },
            benefits: [],
            usageInstructions: [],
            safetyPrecautions: [],
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemTotal: item.totalPrice,
          isStockAvailable: item.inStock,
          availableStock: item.availableStock,
          stockWarning: item.inStock ? undefined : 'Out of Stock',
        })),
        appliedDiscounts: [],
      };
      
      console.log('[cartApi] transformed response:', transformedData);
      return transformedData;
    }

    await mockDelay(200);

    let subtotal = 0;
    const appliedDiscounts: string[] = [];
    let isValid = true;

    const itemDetails = await Promise.all(
      req.items.map(async (item) => {
        try {
          const product = await productsApi.getProductById(item.productId);
          const isStockAvailable = product.inStock && product.stockQuantity >= item.quantity;
          let stockWarning: string | undefined;

          if (!product.inStock || product.stockQuantity <= 0) {
            stockWarning = 'Out of Stock';
            isValid = false;
          } else if (product.stockQuantity < item.quantity) {
            stockWarning = `Only ${product.stockQuantity} items left in stock`;
            isValid = false;
          }

          return {
            product,
            quantity: item.quantity,
            unitPrice: product.price,
            itemTotal: product.price * item.quantity,
            isStockAvailable,
            availableStock: product.stockQuantity,
            stockWarning,
          };
        } catch {
          isValid = false;
          return {
            product: null as any,
            quantity: item.quantity,
            unitPrice: 0,
            itemTotal: 0,
            isStockAvailable: false,
            availableStock: 0,
            stockWarning: 'Product not found',
          };
        }
      })
    );

    // Calculate authoritative backend discount
    let discount = 0;
    if (subtotal > 2000) {
      discount = subtotal * 0.05;
      appliedDiscounts.push('Bulk Order Discount (5%)');
    }

    // Farmer Agri Subsidy Discount
    const farmerSubsidyDiscount = subtotal > 1000 ? 100 : 0;
    if (farmerSubsidyDiscount > 0) {
      appliedDiscounts.push('Kisan Krishi Subsidy (₹100)');
    }

    // Delivery charges: Free delivery above ₹999, else ₹80
    const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 80;

    // Agricultural GST (approx 5% concession rate)
    const taxableAmount = Math.max(0, subtotal - discount - farmerSubsidyDiscount);
    const taxGst = Math.round(taxableAmount * 0.05);

    const totalAmount = taxableAmount + deliveryCharge + taxGst;

    const pricing: OrderPricing = {
      subtotal,
      discount,
      farmerSubsidyDiscount,
      deliveryCharge,
      taxGst,
      totalAmount,
    };

    return {
      isValid,
      pricing,
      itemDetails,
      appliedDiscounts,
    };
  }
};