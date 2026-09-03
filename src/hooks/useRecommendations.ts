import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '../api/recommendations.api';
import { DiseaseRecommendation, FarmerScanHistory } from '../types/recommendation.types';
import { useUIStore } from '../stores/uiStore';

export const useCrops = () => {
  return useQuery({
    queryKey: ['crops'],
    queryFn: () => recommendationsApi.getCrops(),
    staleTime: 1000 * 60 * 30,
  });
};

export const useDiseases = (cropId?: string) => {
  return useQuery({
    queryKey: ['diseases', cropId],
    queryFn: () => recommendationsApi.getDiseases(cropId),
    staleTime: 1000 * 60 * 15,
  });
};

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsApi.getRecommendations(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecommendationLookup = (cropId?: string, diseaseId?: string) => {
  return useQuery({
    queryKey: ['recommendationLookup', cropId, diseaseId],
    queryFn: () => recommendationsApi.getRecommendationByCropAndDisease(cropId!, diseaseId!),
    enabled: !!cropId && !!diseaseId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useFarmerScanHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['farmerScanHistory', userId],
    queryFn: () => recommendationsApi.getFarmerScanHistory(userId),
    staleTime: 1000 * 60 * 2,
  });
};

export const useRecommendationMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const updateMatrixMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DiseaseRecommendation> }) =>
      recommendationsApi.updateRecommendationMatrix(id, updates),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['recommendationLookup'] });
      addToast({
        type: 'success',
        title: 'Advisory Matrix Updated',
        message: `Updated recommendations for ${updated.cropName} - ${updated.diseaseName}.`,
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

  const createScanRecordMutation = useMutation({
    mutationFn: (data: Partial<FarmerScanHistory>) =>
      recommendationsApi.createScanRecord(data),
    onSuccess: (scan) => {
      queryClient.invalidateQueries({ queryKey: ['farmerScanHistory'] });
      addToast({
        type: 'success',
        title: 'Scan Logged to History',
        message: `Identified ${scan.diseaseDetected} with ${scan.confidenceScore}% confidence.`,
      });
    },
  });

  return {
    updateRecommendationMatrix: updateMatrixMutation.mutateAsync,
    isUpdatingMatrix: updateMatrixMutation.isPending,
    createScanRecord: createScanRecordMutation.mutateAsync,
  };
};
