import { Button, Dialog, Icon } from '@alef/sys';

export interface DeviceQRPairProps {}

export function DeviceQRPair({}: DeviceQRPairProps) {
	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button>
					<Icon name="qr-code" /> Pair with QR
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Pair with QR Code">
				<Dialog.Description>Devices paired with a QR code are read-only</Dialog.Description>
			</Dialog.Content>
		</Dialog>
	);
}
