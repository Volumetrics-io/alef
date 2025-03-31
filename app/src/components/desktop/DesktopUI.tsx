import { NavBar } from '@/components/navBar/NavBar';
import { useMedia } from '@/hooks/useMedia';
import { useUndo } from '@/stores/roomStore';
import { useEditorMode, useSelect, useSelectedObjectId } from '@/stores/roomStore/hooks/editing';
import { EditorMode, isPrefixedId } from '@alef/common';
import { Box, Icon, Tabs, Text } from '@alef/sys';
import { ReactNode, Suspense } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DesktopSecondaryContent } from './common/DesktopSecondaryContent';
import cls from './DesktopUI.module.css';
import { DesktopAddFurniture } from './furniture/DesktopAddFurniture';
import { DesktopFurnitureMobileInstructions } from './furniture/DesktopFurnitureMobileInstructions';
import { DesktopFurniturePlacementEditor } from './furniture/DesktopFurniturePlacementEditor';
import { DesktopPlacedFurnitureList } from './furniture/DesktopPlacedFurnitureList';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLayoutTools } from './layouts/DesktopLayoutTools';
import { DesktopLightEditor } from './lighting/DesktopLightEditor';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';
import { HeadsetConnectedIndicator } from './presence/HeadsetConnectedIndicator';
import { useMatchingRoutes } from '@verdant-web/react-router';
import { DevicesPage } from '@/pages/devices/DevicesPage';
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
				<Box className={cls.content}>
					<DesktopUISecondary />
					{!isMobile && children}
				</Box>
			</Tabs>
		</Box>
	);
}

function DesktopUIMain() {
	const routes = useMatchingRoutes();
	const isDevicesPage = routes.some((r) => r.path === '/devices');
	return (
		<Box className={cls.main} stacked p="small">
			<NavBar />
			{isDevicesPage ? <DevicesPage /> : <DesktopEditor />}
		</Box>
	);
}

function DesktopEditor() {
	return (
		<>
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
		</>
	);
}

function DesktopUISecondary() {
	const selectedId = useSelectedObjectId();
	const select = useSelect();
	const [mode] = useEditorMode();

	const title = selectedId ? (isPrefixedId(selectedId, 'fp') ? 'Edit Furniture' : 'Edit Light') : '';
	let content = null;
	if (selectedId) {
		if (mode === 'furniture' && isPrefixedId(selectedId, 'fp')) {
			content = <DesktopFurniturePlacementEditor id={selectedId} />;
		} else if (mode === 'lighting' && isPrefixedId(selectedId, 'lp')) {
			content = <DesktopLightEditor id={selectedId} />;
		}
	}

	return (
		<Suspense>
			<DesktopSecondaryContent open={!!content} onOpenChange={() => select(null)} title={title}>
				{content}
			</DesktopSecondaryContent>
		</Suspense>
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
