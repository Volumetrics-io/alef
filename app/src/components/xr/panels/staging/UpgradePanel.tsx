import { Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { useState } from 'react';
import { HeadsetLogin } from '../../auth/HeadsetLogin';
import { Surface } from '../../ui/Surface';

export function UpgradePanel() {
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
			<Text fontSize={20} fontWeight="semi-bold" color={colors.foreground} textAlign="center">
				Upgrade to Pro
			</Text>
			<Text fontSize={14} color={colors.foreground}>
				Unlock unlimited rooms, new furniture, and more.
			</Text>
			<Text fontSize={14} color={colors.foreground}>
				Start by vising alef.io on your phone or computer to sign up. Then put your headset back on to pair it to your account.
			</Text>
			<Button onClick={onPair} backgroundColor={colors.primary}>
				<Text color={colors.primaryForeground}>Pair This Headset</Text>
			</Button>
		</>
	);
}
