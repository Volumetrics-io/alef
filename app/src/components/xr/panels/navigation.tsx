import { useIsCompanionMode } from '@/hooks/useIsCompanionMode';
import { useRescanRoom } from '@/hooks/useRescanRoom';
import { firstTimeUserXROnboarding } from '@/onboarding/firstTimeUserXR';
import { usePanelState } from '@/stores/editorStore';
import { useEditorMode } from '@/stores/propertyStore/hooks/editing';
import { Container } from '@react-three/uikit';
import { Box, House, Menu, Minimize, Settings, Sofa, Sun, X } from '@react-three/uikit-lucide';
import { OnboardingDot } from '../onboarding/OnboardingDot';
import { Button } from '../ui/Button';
import { Selector, SelectorItem } from '../ui/Selector';

export const Navigation = () => {
	const [mode, setMode] = useEditorMode();
	const [panelState, setPanelState] = usePanelState();
	const isCompanionMode = useIsCompanionMode();

	const { canRescan, rescanRoom } = useRescanRoom();

	return (
		<Container flexGrow={0} flexShrink={1} gap={4}>
			<OnboardingDot onboarding={firstTimeUserXROnboarding} step="welcome" />
			<Button
				flexGrow={0}
				flexShrink={0}
				size="icon"
				variant={panelState === 'open' ? 'destructive' : 'default'}
				onClick={() => {
					setPanelState(panelState === 'open' ? 'closed' : 'open');
					firstTimeUserXROnboarding.completeStep('welcome');
				}}
			>
				{panelState === 'open' ? <X /> : <ModeIcon isCompanionMode={isCompanionMode} />}
			</Button>
			{panelState === 'open' && !isCompanionMode && (
				<Button variant="secondary" size="icon" onClick={() => setPanelState('hidden')}>
					<OnboardingDot onboarding={firstTimeUserXROnboarding} step="minimize" />
					<Minimize />
				</Button>
			)}
			{panelState === 'open' && (
				<>
					<Selector flexDirection="row" size="small">
						<SelectorItem selected={mode === 'layouts'} onClick={() => setMode('layouts')}>
							<OnboardingDot onboarding={firstTimeUserXROnboarding} step="layouts" />
							<House />
						</SelectorItem>
						{!isCompanionMode && (
							<>
								<SelectorItem selected={mode === 'furniture'} onClick={() => setMode('furniture')}>
									<OnboardingDot onboarding={firstTimeUserXROnboarding} step="furniture" />
									<Sofa />
								</SelectorItem>
								<SelectorItem selected={mode === 'lighting'} onClick={() => setMode('lighting')}>
									<OnboardingDot onboarding={firstTimeUserXROnboarding} step="lighting" />
									<Sun />
								</SelectorItem>
							</>
						)}
						<SelectorItem selected={mode === 'settings'} onClick={() => setMode('settings')}>
							<Settings />
						</SelectorItem>
					</Selector>
					{canRescan && (
						<Button size="icon" onClick={() => rescanRoom()}>
							<Box />
						</Button>
					)}
				</>
			)}
		</Container>
	);
};

const ModeIcon = ({ isCompanionMode }: { isCompanionMode: boolean }) => {
	const [panelState] = usePanelState();
	const [mode] = useEditorMode();
	if (panelState !== 'closed' || isCompanionMode) {
		if (mode === 'layouts') return <House />;
		if (mode === 'furniture') return <Sofa />;
		if (mode === 'lighting') return <Sun />;
		if (mode === 'settings') return <Settings />;
	}
	return <Menu />;
};
