import { publicApiClient } from '@/services/publicApi/client';
import { handleErrors } from '@/services/publicApi/utils';
import { queryClient } from '@/services/queryClient';
import { AlefError } from '@alef/common';
import { Frame, Heading, Input, Text } from '@alef/sys';
import { useState } from 'react';
import toast from 'react-hot-toast';

export interface DevicePaircodeClaimProps {}

export function DevicePaircodeClaim({}: DevicePaircodeClaimProps) {
	const [code, setCode] = useState<string>('');

	const submit = async (code: string) => {
		const result = await handleErrors(
			publicApiClient.devices.paircode[':code'].claim.$post({
				param: { code },
			})
		);
		if (result.ok) {
			queryClient.invalidateQueries({
				queryKey: ['devices'],
			});
			toast.success('Device paired');
			setCode('');
		} else {
			const asAlefError = AlefError.wrap(result);
			if (asAlefError.code < AlefError.Code.InternalServerError) {
				toast.error(asAlefError.message);
			} else {
				toast.error('Failed to pair device');
			}
		}
	};

	return (
		<Frame p stacked gapped>
			<Heading level={4}>Use a code</Heading>
			<Text>If automatic discovery isn't working, you can manually enter the device's pair code.</Text>
			<Input
				value={code}
				onValueChange={(val) => {
					setCode(val.toUpperCase());
					if (val.length === 5) {
						submit(val.toUpperCase());
					}
				}}
				pattern="/^[A-Z0-9]{5}$/"
				onFocus={(ev) => {
					ev.target.select();
				}}
				placeholder="XXXXX"
			/>
		</Frame>
	);
}
