import { Product, ProductCategory } from './product.types';

export interface Crop {
  id: string;
  name: string;
  hindiName?: string;

  category:
    | 'Vegetables'
    | 'Cash Crops'
    | 'Cereals & Grains'
    | 'Pulses'
    | 'Oilseeds'
    | 'Fruits';

  imageUrl: string;

  seasons: ('Kharif' | 'Rabi' | 'Zaid')[];

  commonDiseasesCount: number;
}

export type DiseaseSeverity =
  | 'Mild'
  | 'Moderate'
  | 'Severe'
  | 'Critical';

export type AffectedPart =
  | 'Leaves'
  | 'Stem'
  | 'Fruits'
  | 'Roots'
  | 'Flowers';

export interface CropDisease {
  id: string;
  cropId: string;
  cropName: string;
  name: string;
  hindiName?: string;
  scientificName?: string;

  severity: DiseaseSeverity;

  affectedParts: AffectedPart[];

  symptoms: string[];
  causes: string[];
  preventiveMeasures: string[];

  imageUrl: string;
}

export interface RecommendedProductItem {
  productId: string;
  product?: Product;

  category: ProductCategory;

  role:
    | 'Primary Treatment'
    | 'Bio-Stimulant / Recovery'
    | 'Preventive Foliar'
    | 'Soil Enhancer';

  priority: number;

  reason: string;

  applicationSchedule: string;

  isActive: boolean;
}

export interface DiseaseRecommendation {
  id: string;

  cropId: string;
  cropName: string;

  diseaseId: string;
  diseaseName: string;

  diseaseSeverity: DiseaseSeverity;

  advisoryNote: string;

  recommendedProducts: RecommendedProductItem[];

  isActive: boolean;

  updatedAt: string;
}

export interface FarmerScanHistory {
  id: string;

  scanCode: string;

  cropName: string;
  cropId: string;

  diseaseDetected: string;
  diseaseId: string;

  confidenceScore: number;

  imageUrl: string;

  scanDate: string;

  plotName: string;

  status:
    | 'Treated'
    | 'Active Issue'
    | 'Resolved';

  recommendations: RecommendedProductItem[];
}