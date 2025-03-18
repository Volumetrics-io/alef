import { useRescanRoom } from '@/hooks/useRescanRoom';
import { firstTimeUserXROnboarding } from '@/onboarding/firstTimeUserXR';
import { useEditorStageMode, usePanelState } from '@/stores/editorStore';
import { Container } from '@react-three/uikit';
import { Box, House, Menu, Minimize, Settings, Sofa, Sun, X } from '@react-three/uikit-lucide';
import { Button } from '../ui/Button';
import { Selector, SelectorItem } from '../ui/Selector';

export const Navigation = () => {
	const [mode, setMode] = useEditorStageMode();
	const [panelState, setPanelState] = usePanelState();

	const { canRescan, rescanRoom } = useRescanRoom();

	return (
		<Container flexGrow={0} flexShrink={1} gap={4}>
			<Button
				flexGrow={0}
				flexShrink={0}
				size="icon"
				variant={panelState === 'open' ? 'destructive' : 'default'}
				onClick={() => {
					if (panelState === 'open') {
						setMode(null);
					}
					setPanelState(panelState === 'open' ? 'closed' : 'open');
					firstTimeUserXROnboarding.completeStep('welcome');
				}}
			>
				{panelState === 'open' ? <X /> : <ModeIcon />}
			</Button>
			{panelState === 'open' && (
				<Button variant="secondary" size="icon" onClick={() => setPanelState('hidden')}>
					<Minimize />
				</Button>
			)}
			{panelState === 'open' && (
				<>
					<Selector flexDirection="row" size="small">
						<SelectorItem selected={mode === 'layout'} onClick={() => setMode('layout')}>
							<House />
						</SelectorItem>
						<SelectorItem selected={mode === 'furniture'} onClick={() => setMode('furniture')}>
							<Sofa />
						</SelectorItem>
						<SelectorItem selected={mode === 'lighting'} onClick={() => setMode('lighting')}>
							<Sun />
						</SelectorItem>
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

const ModeIcon = () => {
	const [mode] = useEditorStageMode();
	if (mode === 'layout') return <House />;
	if (mode === 'furniture') return <Sofa />;
	if (mode === 'lighting') return <Sun />;
	if (mode === 'settings') return <Settings />;
	return <Menu />;
};
