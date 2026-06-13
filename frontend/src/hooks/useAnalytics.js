import { useQuery } from '@tanstack/react-query';
import { getLinkAnalytics, getOverallAnalytics, getPublicLinkAnalytics } from '@/services/analyticsService';

export function useGetLinkAnalytics(linkId) {
  return useQuery({
    queryKey: ['analytics', linkId],
    queryFn: () => getLinkAnalytics(linkId),
    enabled: !!linkId, // Only fetch if linkId exists
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetOverallAnalytics() {
  return useQuery({
    queryKey: ['overallAnalytics'],
    queryFn: getOverallAnalytics,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetPublicLinkAnalytics(shortCode) {
  return useQuery({
    queryKey: ['publicAnalytics', shortCode],
    queryFn: () => getPublicLinkAnalytics(shortCode),
    enabled: !!shortCode,
    staleTime: 1000 * 60 * 5,
  });
}