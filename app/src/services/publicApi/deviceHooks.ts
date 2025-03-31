import { PrefixedId } from '@alef/common';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import toast from 'react-hot-toast';
import { deviceName, deviceType } from '../os';
import { queryClient } from '../queryClient';
import { publicApiClient } from './client';
import { useMe } from './userHooks';
import { fallbackWhenOfflineOrError, handleErrors } from './utils';

export function useDefaultDeviceName() {
	const { data: me } = useMe();
	return me ? `${me?.friendlyName}'s ${deviceName}` : deviceName;
}

export function useDeviceDiscovery() {
	const defaultName = useDefaultDeviceName();
	return useSuspenseQuery({
		queryKey: ['deviceDiscovery'],
		networkMode: 'always',

		queryFn: async () => {
			const result = await handleErrors(
				publicApiClient.devices.discover.$get({
					query: {
						description: defaultName,
						type: deviceType,
					},
				})
			);
			// if the API indicates this device was assigned, refetch
			// the check for logged in status.
			if (result.wasAssigned) {
				queryClient.invalidateQueries({ queryKey: ['me'] });
				queryClient.invalidateQueries({ queryKey: ['currentDevice'] });
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

export function useUpdateDevice() {
	return useMutation({
		mutationFn: ({
			deviceId,
			updates,
		}: {
			deviceId: PrefixedId<'d'>;
			updates: {
				displayMode?: 'staging' | 'viewing';
				name?: string;
			};
		}) => {
			return handleErrors(
				publicApiClient.devices[':deviceId'].$put({
					param: {
						deviceId,
					},
					json: updates,
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

export function useCurrentDevice() {
	const defaultName = useDefaultDeviceName();
	return useSuspenseQuery({
		queryKey: ['devices', 'current'],
		queryFn: async () => {
			return fallbackWhenOfflineOrError(
				publicApiClient.devices.self.$get({
					query: {
						description: defaultName,
						type: deviceType,
					},
				}),
				null
			);
		},
	});
}

export type DeviceResponseData = InferResponseType<typeof publicApiClient.devices.$get>[number];
