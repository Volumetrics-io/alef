import { Container, Text } from '@react-three/uikit';
import { useState } from 'react';
import { HeadsetLogin } from '../../auth/HeadsetLogin';
import { Surface } from '../../ui/Surface';
import { Button } from '@/components/xr/ui/Button';
import { SettingsIcon } from '@react-three/uikit-lucide';
import { useMe } from '@/services/publicApi/userHooks';

export function SettingsPanel() {
	const [isPairing, setIsPairing] = useState(false);
	const { data: session } = useMe();
	const isLoggedIn = !!session;
	return (
		<Surface flexDirection="column" 
		flexWrap="no-wrap" 
		width={500} 
		height={400} 
		gap={10}
		padding={20}
		>
			<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
				<SettingsIcon width={20} height={20} />
				<Text fontSize={20}>
					Settings
				</Text>
			</Container>
			{!isLoggedIn && (
				<>
					<Login onPair={() => setIsPairing(!isPairing)} />
					{isPairing && <HeadsetLogin onCancel={() => setIsPairing(false)} />}
				</>
			)}
		</Surface>
	);
}

function Login({ onPair }: { onPair: () => void }) {
	return (
		<Container flexDirection="column" gap={4}>
			<Text fontSize={16} fontWeight="semi-bold" >
					Login
				</Text>
			<Container flexDirection="row" gap={30} justifyContent="space-between">
				<Text fontSize={14}>
					To login in on this device. Open alef.io on your phone or computer, then return to your headset to pair it to your account.
				</Text>
				<Button onClick={onPair}>
				<Text>Get started</Text>
			</Button>
			</Container>
		</Container>
	);
}
