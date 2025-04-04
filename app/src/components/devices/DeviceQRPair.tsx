import { useUpsertDefaultPublicAccessToken } from '@/services/publicApi/deviceHooks';
import { Box, Button, Dialog, Icon, Spinner } from '@alef/sys';
import QRCode from 'react-qr-code';

export interface DeviceQRPairProps {}

export function DeviceQRPair({}: DeviceQRPairProps) {
	const { mutate, data } = useUpsertDefaultPublicAccessToken();
	return (
		<Dialog
			onOpenChange={(open) => {
				// only generate the token after opening... having one at all is a minor
				// security concern, so no need to open that up for users who didn't opt in.
				if (open) {
					mutate();
				}
			}}
		>
			<Dialog.Trigger asChild>
				<Button>
					<Icon name="qr-code" /> Pair with QR
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Pair with QR Code">
				<Dialog.Description>Devices paired with a QR code are read-only</Dialog.Description>
				<Box full layout="center center" stacked gapped>
					{data ? (
						<>
							<QRCode value={data.token} />
							<span>{data.token}</span>
						</>
					) : (
						<Spinner />
					)}
				</Box>
			</Dialog.Content>
		</Dialog>
	);
}
