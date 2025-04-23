import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { queryClient } from '../queryClient';
import { publicApiClient } from './client';
import { handleErrors } from './utils';

export function useProducts() {
	return useSuspenseQuery({
		queryKey: ['products'],
		queryFn: async () => {
			return handleErrors(publicApiClient.stripe.products.$get());
		},
	});
}

export function useCancelSubscription() {
	return useMutation({
		mutationFn: async () => {
			return handleErrors(publicApiClient.stripe['cancel-subscription'].$post());
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['organization'] });
		},
	});
}
