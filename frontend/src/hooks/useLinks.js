import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLinks, createLink, deleteLink, updateLink, bulkCreateLinks } from '@/services/linkService';

export function useGetLinks(params = {}) {
  return useQuery({
    queryKey: ['links', params],
    queryFn: () => getLinks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error) => {
      console.error('Failed to create link:', error);
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error) => {
      console.error('Failed to delete link:', error);
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error) => {
      console.error('Failed to update link:', error);
    },
  });
}

export function useBulkCreateLinks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkCreateLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (error) => {
      console.error('Failed to bulk create links:', error);
    },
  });
}