import { Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { useState } from 'react';
import { HeadsetLogin } from '../../auth/HeadsetLogin';
import { Surface } from '../../ui/Surface';

export function SettingsPanel() {
	const [isPairing, setIsPairing] = useState(false);
	return (
		<Surface flexDirection="column" flexWrap="no-wrap" width={300} gap={10} marginX="auto">
			{isPairing ? <HeadsetLogin /> : <Explainer onPair={() => setIsPairing(true)} />}
		</Surface>
	);
}

function Explainer({ onPair }: { onPair: () => void }) {
	return (
		<>
			<Text fontSize={14} fontWeight="semi-bold" color={colors.foreground}>
				Device pairing
			</Text>
			<Text fontSize={12} color={colors.foreground}>
				Start from a logged in device, then return to your headset to pair it to your account.
			</Text>
			<Button onClick={onPair} backgroundColor={colors.primary}>
				<Text color={colors.primaryForeground}>Pair This Headset</Text>
			</Button>
		</>
	);
}
