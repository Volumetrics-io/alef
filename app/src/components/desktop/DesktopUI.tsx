import { useMedia } from '@/hooks/useMedia';
import { useUndo } from '@/stores/roomStore';
import { useEditorMode } from '@/stores/roomStore/hooks/editing';
import { EditorMode } from '@alef/common';
import { Box, Icon, Tabs, Text } from '@alef/sys';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cls from './DesktopUI.module.css';
import { DesktopAddFurniture } from './furniture/DesktopAddFurniture';
import { DesktopFurnitureMobileInstructions } from './furniture/DesktopFurnitureMobileInstructions';
import { DesktopPlacedFurnitureList } from './furniture/DesktopPlacedFurnitureList';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';
import { HeadsetConnectedIndicator } from './presence/HeadsetConnectedIndicator';
import { NavBar } from '@/components/navBar/NavBar';
import { DesktopLayoutTools } from './layouts/DesktopLayoutTools';
import { useContainerStore } from './stores/useContainer';

export interface DesktopUIProps {
	children?: ReactNode;
}

export function DesktopUI({ children }: DesktopUIProps) {
	const [mode, setMode] = useEditorMode();
	// don't bother rendering content, it won't be visible.
	const isMobile = useMedia('(max-width: 768px)');

	// bind ctrl+z to undo, ctrl+shift+z to redo
	const { undo, redo } = useUndo();
	useHotkeys('mod+z', undo);
	useHotkeys('mod+shift+z, mod+y', redo);

	return (
		<Box asChild className={cls.root}>
			<Tabs value={mode || 'layouts'} onValueChange={(m) => setMode(m as EditorMode)}>
				<DesktopUIMain />
				{!isMobile && <Box className={cls.content}>{children}</Box>}
			</Tabs>
		</Box>
	);
}

function DesktopUIMain() {
	const container = useRef<HTMLDivElement>(null);

	const setContainer = useContainerStore((state) => state.setContainer);

	useEffect(() => {
		setContainer(container.current);
	}, [container.current]);

	return (
		<Box ref={container} className={cls.main} stacked p="small">
			<NavBar />
			<Box p="small" layout="center center">
				<HeadsetConnectedIndicator />
			</Box>
			<Tabs.List>
				<Tabs.Trigger value="layouts">
					<Icon name="house" />
					<Text>Layouts</Text>
				</Tabs.Trigger>
				<Tabs.Trigger value="furniture">
					<Icon name="sofa" />
					<Text>Furniture</Text>
				</Tabs.Trigger>
				<Tabs.Trigger value="lighting">
					<Icon name="lightbulb" />
					<Text>Lighting</Text>
				</Tabs.Trigger>
			</Tabs.List>
			<DesktopUITabContent value="layouts">
				<DesktopLayoutsPicker />
				<DesktopLayoutTools />
			</DesktopUITabContent>
			<DesktopUITabContent value="furniture">
				<Box stacked gapped>
					<DesktopFurnitureMobileInstructions />
					<DesktopPlacedFurnitureList />
				</Box>
				<DesktopAddFurniture />
			</DesktopUITabContent>
			<DesktopUITabContent value="lighting">
				<DesktopLightsMainEditor />
			</DesktopUITabContent>
		</Box>
	);
}

function DesktopUITabContent({ children, value }: { children: ReactNode; value: string }) {
	return (
		<Tabs.Content value={value}>
			<Suspense>
				<Box full stacked justify="between">
					{children}
				</Box>
			</Suspense>
		</Tabs.Content>
	);
}
