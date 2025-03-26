import { Button } from '@/components/xr/ui/Button';
import { useColorTheme } from '@/hooks/useColorTheme';
import { pairDeviceXROnboarding } from '@/onboarding/pairDeviceXR';
import { fetch } from '@/services/fetch';
import { useMe } from '@/services/publicApi/userHooks';
import { queryClient } from '@/services/queryClient';
import { Container, Text } from '@react-three/uikit';
import { ToggleGroup, ToggleGroupItem } from '@react-three/uikit-default';
import { SettingsIcon } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { HeadsetLogin } from '../../auth/HeadsetLogin';
import { OnboardingDot } from '../../onboarding/OnboardingDot';
import { Heading } from '../../ui/Heading';
import { Surface } from '../../ui/Surface';

export function SettingsPanel() {
	const [isPairing, setIsPairing] = useState(false);
	const { data: session } = useMe();
	const isLoggedIn = !!session;
	return (
		<Surface flexDirection="column" flexWrap="no-wrap" width={500} height={400} gap={10} padding={20}>
			<Container marginX="auto" flexDirection="row" gap={6} alignItems="center" justifyContent="center">
				<SettingsIcon width={20} height={20} />
				<Heading level={3}>Settings</Heading>
			</Container>
			{!isLoggedIn ? (
				<>
					<Login onPair={() => setIsPairing(!isPairing)} />
					{isPairing && <HeadsetLogin onCancel={() => setIsPairing(false)} />}
				</>
			) : (
				<Logout />
			)}
			<ToggleTheme />
		</Surface>
	);
}

function SettingsItem({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<Container flexDirection="column" gap={2}>
			<Heading level={4}>{label}</Heading>
			<Container width="100%" flexDirection="row" gap={30} justifyContent="space-between">
				{children}
			</Container>
		</Container>
	);
}

function Login({ onPair }: { onPair: () => void }) {
	return (
		<SettingsItem label="Log in">
			<OnboardingDot onboarding={pairDeviceXROnboarding} step="logInButton" />
			<Text>Login to access more features.</Text>
			<Button onClick={onPair}>
				<Text>Get started</Text>
			</Button>
		</SettingsItem>
	);
}

function Logout() {
	return (
		<SettingsItem label="Log out">
			<Text>Log out on this device.</Text>
			<Button
				onClick={async () => {
					await fetch(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/logout`, {
						method: 'POST',
						credentials: 'include',
					});
					queryClient.resetQueries(); // clear all queries to reset the state
				}}
			>
				<Text>Log out</Text>
			</Button>
		</SettingsItem>
	);
}

function ToggleTheme() {
	const [theme, setTheme] = useColorTheme();

	return (
		<SettingsItem label="Theme">
			<Text>Toggle the app theme.</Text>
			<ToggleGroup>
				<ToggleGroupItem checked={theme === 'system'} onCheckedChange={(v) => v && setTheme('system')}>
					<Text>System</Text>
				</ToggleGroupItem>
				<ToggleGroupItem checked={theme === 'light'} onCheckedChange={(v) => v && setTheme('light')}>
					<Text>Light</Text>
				</ToggleGroupItem>
				<ToggleGroupItem checked={theme === 'dark'} onCheckedChange={(v) => v && setTheme('dark')}>
					<Text>Dark</Text>
				</ToggleGroupItem>
			</ToggleGroup>
		</SettingsItem>
	);
}
