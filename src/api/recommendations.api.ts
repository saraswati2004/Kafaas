import { apiClient, API_BASE_URL, mockDelay } from './client';
import { Crop, CropDisease, DiseaseRecommendation, FarmerScanHistory } from '../types/recommendation.types';
import { MOCK_CROPS, MOCK_DISEASES, MOCK_RECOMMENDATIONS, MOCK_SCAN_HISTORY } from './mockData';
import { productsApi } from './products.api';

let localRecommendations = [...MOCK_RECOMMENDATIONS];
let localScanHistory = [...MOCK_SCAN_HISTORY];

export const recommendationsApi = {
  getCrops: async (): Promise<Crop[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<Crop[]>('/crops');
      return res.data;
    }
    await mockDelay(150);
    return MOCK_CROPS;
  },

  getDiseases: async (cropId?: string): Promise<CropDisease[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<CropDisease[]>('/diseases', { params: { cropId } });
      return res.data;
    }
    await mockDelay(200);
    if (cropId) {
      return MOCK_DISEASES.filter((d) => d.cropId === cropId);
    }
    return MOCK_DISEASES;
  },

  getRecommendations: async (): Promise<DiseaseRecommendation[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<DiseaseRecommendation[]>('/recommendations');
      return res.data;
    }
    await mockDelay(250);

    // Populate actual products into recommendations
    const populated = await Promise.all(
      localRecommendations.map(async (rec) => {
        const productsWithDetails = await Promise.all(
          rec.recommendedProducts.map(async (rp) => {
            try {
              const product = await productsApi.getProductById(rp.productId);
              return { ...rp, product };
            } catch {
              return rp;
            }
          })
        );
        return {
          ...rec,
          recommendedProducts: productsWithDetails,
        };
      })
    );

    return populated;
  },

  getRecommendationByCropAndDisease: async (
    cropId: string,
    diseaseId: string
  ): Promise<DiseaseRecommendation | null> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<DiseaseRecommendation>('/recommendations/lookup', {
        params: { cropId, diseaseId },
      });
      return res.data;
    }
    await mockDelay(300);

    const rec = localRecommendations.find(
      (r) => r.cropId === cropId && r.diseaseId === diseaseId && r.isActive
    );
    if (!rec) return null;

    const populatedProducts = await Promise.all(
      rec.recommendedProducts.map(async (rp) => {
        try {
          const product = await productsApi.getProductById(rp.productId);
          return { ...rp, product };
        } catch {
          return rp;
        }
      })
    );

    return {
      ...rec,
      recommendedProducts: populatedProducts,
    };
  },

  getFarmerScanHistory: async (_userId?: string): Promise<FarmerScanHistory[]> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<FarmerScanHistory[]>('/farmer/scans');
      return res.data;
    }
    await mockDelay(200);
    return localScanHistory;
  },

  createScanRecord: async (data: Partial<FarmerScanHistory>): Promise<FarmerScanHistory> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<FarmerScanHistory>('/farmer/scans', data);
      return res.data;
    }
    await mockDelay(300);
    const newScan: FarmerScanHistory = {
      id: `scan-${Date.now()}`,
      scanCode: `SCAN-${(data.cropName || 'CROP').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      cropName: data.cropName || 'Tomato',
      cropId: data.cropId || 'crop-tom',
      diseaseDetected: data.diseaseDetected || 'Early Blight',
      diseaseId: data.diseaseId || 'dis-tom-01',
      confidenceScore: data.confidenceScore || 94,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      scanDate: new Date().toISOString(),
      plotName: data.plotName || 'Village Farm Block A',
      status: 'Active Issue',
      recommendations: data.recommendations || [],
    };

    localScanHistory = [newScan, ...localScanHistory];
    return newScan;
  },

  updateRecommendationMatrix: async (
    id: string,
    updates: Partial<DiseaseRecommendation>
  ): Promise<DiseaseRecommendation> => {
    if (API_BASE_URL) {
      const res = await apiClient.put<DiseaseRecommendation>(`/admin/recommendations/${id}`, updates);
      return res.data;
    }
    await mockDelay(300);
    const index = localRecommendations.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Recommendation matrix item not found');

    localRecommendations[index] = {
      ...localRecommendations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return localRecommendations[index];
  },

  createRecommendationMatrix: async (
    data: Partial<DiseaseRecommendation>
  ): Promise<DiseaseRecommendation> => {
    if (API_BASE_URL) {
      const res = await apiClient.post<DiseaseRecommendation>('/admin/recommendations', data);
      return res.data;
    }
    await mockDelay(300);
    const newRec: DiseaseRecommendation = {
      id: `rec-${Date.now()}`,
      cropId: data.cropId || 'crop-tom',
      cropName: data.cropName || 'Tomato',
      diseaseId: data.diseaseId || 'dis-tom-01',
      diseaseName: data.diseaseName || 'Early Blight',
      diseaseSeverity: data.diseaseSeverity || 'Severe',
      advisoryNote: data.advisoryNote || 'Advisory action recommendations.',
      recommendedProducts: data.recommendedProducts || [],
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    localRecommendations = [newRec, ...localRecommendations];
    return newRec;
  }
};
