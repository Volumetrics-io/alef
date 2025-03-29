import { useMedia } from '@/hooks/useMedia';
import { useDetailsOpen } from '@/stores/editorStore';
import { useUndo } from '@/stores/roomStore';
import { useEditorMode, useOnSelectionChanged } from '@/stores/roomStore/hooks/editing';
import { EditorMode } from '@alef/common';
import { Box, Frame, Icon, Tabs, Text } from '@alef/sys';
import clsx from 'clsx';
import { ReactNode, Suspense } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import cls from './DesktopUI.module.css';
import { DesktopAddFurniture } from './furniture/DesktopAddFurniture';
import { DesktopFurnitureEditor } from './furniture/DesktopFurnitureEditor';
import { DesktopFurnitureMobileInstructions } from './furniture/DesktopFurnitureMobileInstructions';
import { DesktopPlacedFurnitureList } from './furniture/DesktopPlacedFurnitureList';
import { DesktopLayoutEditor } from './layouts/DesktopLayoutEditor';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLightEditor } from './lighting/DesktopLightEditor';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';
import { HeadsetConnectedIndicator } from './presence/HeadsetConnectedIndicator';
import { NavBar } from '@/components/navBar/NavBar';
import { DesktopLayoutTools } from './layouts/DesktopLayoutTools';
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
				{/* <DesktopUISecondary /> */}
			</Tabs>
		</Box>
	);
}

function DesktopUIMain() {
	return (
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
			<Tabs.Content value="layouts">
				<Suspense>
					<Box full stacked justify="between">
						<DesktopLayoutsPicker />
						<DesktopLayoutTools />
					</Box>
				</Suspense>
			</Tabs.Content>
			<Tabs.Content value="furniture">
				<Suspense>
					<Box full stacked justify="between">
						<Box stacked gapped>
							<DesktopFurnitureMobileInstructions />
							<DesktopPlacedFurnitureList />
						</Box>
						<DesktopAddFurniture />
					</Box>
				</Suspense>
			</Tabs.Content>
			<Tabs.Content value="lighting">
				<DesktopLightsMainEditor />
			</Tabs.Content>
		</Box>
	);
}

function DesktopUISecondary() {
	const [open, setOpen] = useDetailsOpen();
	// open details panel when selection changes
	useOnSelectionChanged(() => setOpen(true));
	return (
		<Box className={cls.secondary}>
			<Frame float="top-left" className={cls.secondaryToggle} onClick={() => setOpen(!open)} aria-label="Toggle details panel" tabIndex={0} role="button">
				<Icon name={open ? 'panel-right-close' : 'panel-right-open'} className={cls.secondaryContentToggleIcon} />
				<span className={cls.secondaryContentToggleLabel}>Details</span>
			</Frame>
			<Box className={clsx(cls.secondaryContent, open && cls.secondaryContentOpen)}>
				<Box className={cls.secondaryContentInner}>
					<Tabs.Content value="layouts">
						<Suspense>
							<DesktopLayoutEditor />
						</Suspense>
					</Tabs.Content>
					<Tabs.Content value="furniture">
						<Suspense>
							<DesktopFurnitureEditor />
						</Suspense>
					</Tabs.Content>
					<Tabs.Content value="lighting">
						<Suspense>
							<DesktopLightEditor />
						</Suspense>
					</Tabs.Content>
				</Box>
			</Box>
		</Box>
	);
}
