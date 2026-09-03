import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductFilterParams, Product } from '../types/product.types';
import { useUIStore } from '../stores/uiStore';

export const useProducts = (params: ProductFilterParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
    staleTime: 1000 * 60 * 15,
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productsApi.getFeaturedProducts(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedProducts = (productId?: string) => {
  return useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: () => productsApi.getRelatedProducts(productId!),
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProductAdminMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const createProductMutation = useMutation({
    mutationFn: (data: Partial<Product>) => productsApi.createProduct(data),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast({
        type: 'success',
        title: 'Product Created',
        message: `${newProduct.name} has been added to the catalog.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Failed to create product',
        message: err.message,
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) =>
      productsApi.updateProduct(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updated.id] });
      addToast({
        type: 'success',
        title: 'Product Updated',
        message: `${updated.name} has been updated.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: err.message,
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      addToast({
        type: 'info',
        title: 'Product Removed',
        message: 'Product listing removed from catalog.',
      });
    },
  });

  return {
    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    isDeleting: deleteProductMutation.isPending,
  };
};
