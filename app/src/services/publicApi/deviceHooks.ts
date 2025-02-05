import { PrefixedId } from '@alef/common';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { queryClient } from '../queryClient';
import { publicApiClient } from './client';
import { handleErrors } from './utils';

export function useDeviceDiscovery(description?: string) {
	return useSuspenseQuery({
		queryKey: ['deviceDiscovery'],
		networkMode: 'always',

		queryFn: async () => {
			const result = await handleErrors(
				publicApiClient.devices.discover.$get({
					query: {
						description,
					},
				})
			);
			// if the API indicates this device was assigned, refetch
			// the check for logged in status.
			if (result.wasAssigned) {
				queryClient.invalidateQueries({ queryKey: ['me'] });
				toast.success('Success! Your device is logged in.');
			}
			return result;
		},
		// refetch every 5 seconds to poll for new connected devices
		refetchInterval: 5000,
		refetchIntervalInBackground: true,
	});
}

export function useDevices() {
	return useSuspenseQuery({
		queryKey: ['devices'],
		queryFn: () => {
			return handleErrors(publicApiClient.devices.$get());
		},
	});
}

export function useClaimDevice({ onSuccess }: { onSuccess?: () => void } = {}) {
	return useMutation({
		mutationFn: (deviceId: PrefixedId<'d'>) => {
			return handleErrors(
				publicApiClient.devices[':deviceId'].claim.$post({
					param: {
						deviceId,
					},
				})
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['devices'],
			});
			queryClient.invalidateQueries({
				queryKey: ['deviceDiscovery'],
			});
			onSuccess?.();
		},
	});
}

export function useDiscoverySuggest() {
	return useMutation({
		mutationFn: (deviceId: PrefixedId<'d'>) => {
			return handleErrors(
				publicApiClient.devices.discover.suggest.$post({
					json: {
						deviceId,
					},
				})
			);
		},
	});
}

export function useDeleteDevice() {
	return useMutation({
		mutationFn: (deviceId: PrefixedId<'d'>) => {
			return handleErrors(
				publicApiClient.devices[':deviceId'].$delete({
					param: {
						deviceId,
					},
				})
			);
		},
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: ['devices'],
			});
		},
	});
}
