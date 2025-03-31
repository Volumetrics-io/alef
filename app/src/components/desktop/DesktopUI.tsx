import { NavBar } from '@/components/navBar/NavBar';
import { useMedia } from '@/hooks/useMedia';
import { useUndo } from '@/stores/roomStore';
import { useEditorMode } from '@/stores/roomStore/hooks/editing';
import { EditorMode } from '@alef/common';
import { Box, Dialog, Icon, Tabs, Text } from '@alef/sys';
import { ReactNode, Suspense } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cls from './DesktopUI.module.css';
import { DesktopAddFurniture } from './furniture/DesktopAddFurniture';
import { DesktopFurnitureMobileInstructions } from './furniture/DesktopFurnitureMobileInstructions';
import { DesktopPlacedFurnitureList } from './furniture/DesktopPlacedFurnitureList';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLayoutTools } from './layouts/DesktopLayoutTools';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';
import { HeadsetConnectedIndicator } from './presence/HeadsetConnectedIndicator';

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
	return (
		<Dialog.ContainerProvider>
			<Box className={cls.main} stacked p="small">
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
					<DesktopFurnitureMobileInstructions />
					<DesktopPlacedFurnitureList />
					<DesktopAddFurniture />
				</DesktopUITabContent>
				<DesktopUITabContent value="lighting">
					<DesktopLightsMainEditor />
				</DesktopUITabContent>
			</Box>
		</Dialog.ContainerProvider>
	);
}

function DesktopUITabContent({ children, value }: { children: ReactNode; value: string }) {
	return (
		<Tabs.Content value={value}>
			<Suspense>
				<Box full stacked gapped justify="between">
					{children}
				</Box>
			</Suspense>
		</Tabs.Content>
	);
}
