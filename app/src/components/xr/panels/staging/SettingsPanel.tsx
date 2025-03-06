import { Container, isDarkMode, Text, setPreferredColorScheme } from '@react-three/uikit';
import { useEffect, useState } from 'react';
import { HeadsetLogin } from '../../auth/HeadsetLogin';
import { Surface } from '../../ui/Surface';
import { Button } from '@/components/xr/ui/Button';
import { SettingsIcon } from '@react-three/uikit-lucide';
import { useMe } from '@/services/publicApi/userHooks';
import { Switch } from '../../ui/Switch';
import { Heading } from '../../ui/Heading';
import { useLocalStorage } from '@/hooks/useStorage';

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
			<Container marginX="auto" flexDirection="row" gap={6} alignItems="center" justifyContent="center">
				<SettingsIcon width={20} height={20} />
				<Heading level={3}>
					Settings
				</Heading>
			</Container>
			{!isLoggedIn && (
				<>
					<Login onPair={() => setIsPairing(!isPairing)} />
					{isPairing && <HeadsetLogin onCancel={() => setIsPairing(false)} />}
				</>
			)}
			<ToggleTheme />
		</Surface>
	);
}

function SettingsItem({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Container flexDirection="column" gap={2}>
			<Heading level={4}>
				{label}
			</Heading>
			<Container width="100%" flexDirection="row" gap={30} justifyContent="space-between">
				{children}
			</Container>
		</Container>
	);
}

function Login({ onPair }: { onPair: () => void }) {
	return (
		<SettingsItem label="Login">
			<Text>
				Login to access more features.
			</Text>
			<Button onClick={onPair}>
				<Text>Get started</Text>
			</Button>
		</SettingsItem>
	);
}

function ToggleTheme() {
	const [theme, setTheme] = useLocalStorage('theme', isDarkMode.value, false);

	useEffect(() => {
		setPreferredColorScheme(theme ? 'dark' : 'light');
	}, [theme]);
	
	return (
		<SettingsItem label="Theme">
			<Text>
				Toggle the app theme.
			</Text>
			<Switch defaultChecked={theme} onCheckedChange={() => setTheme(!theme)} />
		</SettingsItem>
	);
}
