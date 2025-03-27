import { useMedia } from '@/hooks/useMedia';
import { useDetailsOpen } from '@/stores/editorStore';
import { useEditorMode } from '@/stores/roomStore/hooks/editing';
import { EditorMode } from '@alef/common';
import { Box, Frame, Icon, Tabs } from '@alef/sys';
import clsx from 'clsx';
import { ReactNode, Suspense } from 'react';
import cls from './DesktopUI.module.css';
import { DesktopAddFurniture } from './furniture/DesktopAddFurniture';
import { DesktopFurnitureEditor } from './furniture/DesktopFurnitureEditor';
import { DesktopPlacedFurnitureList } from './furniture/DesktopPlacedFurnitureList';
import { DesktopAddLayout } from './layouts/DesktopAddLayout';
import { DesktopLayoutEditor } from './layouts/DesktopLayoutEditor';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLightEditor } from './lighting/DesktopLightEditor';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';
import { HeadsetConnectedIndicator } from './presence/HeadsetConnectedIndicator';

export interface DesktopUIProps {
	children?: ReactNode;
}

export function DesktopUI({ children }: DesktopUIProps) {
	const [mode, setMode] = useEditorMode();
	// don't bother rendering content, it won't be visible.
	const isMobile = useMedia('(max-width: 768px)');

	return (
		<Box asChild className={cls.root}>
			<Tabs value={mode || 'layouts'} onValueChange={(m) => setMode(m as EditorMode)}>
				<DesktopUIMain />
				{!isMobile && <Box className={cls.content}>{children}</Box>}
				<DesktopUISecondary />
			</Tabs>
		</Box>
	);
}

function DesktopUIMain() {
	return (
		<Box className={cls.main} stacked>
			<Box p="small" layout="center center">
				<HeadsetConnectedIndicator />
			</Box>
			<Tabs.List className={cls.tabs}>
				<Tabs.Trigger value="layouts">
					<Icon name="house" />
				</Tabs.Trigger>
				<Tabs.Trigger value="furniture">
					<Icon name="sofa" />
				</Tabs.Trigger>
				<Tabs.Trigger value="lighting">
					<Icon name="lightbulb" />
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="layouts">
				<Suspense>
					<Box p="small" full stacked justify="between">
						<DesktopLayoutsPicker />
						<DesktopAddLayout />
					</Box>
				</Suspense>
			</Tabs.Content>
			<Tabs.Content value="furniture">
				<Suspense>
					<Box p="small" full stacked justify="between">
						<DesktopPlacedFurnitureList />
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
	return (
		<Box className={cls.secondary}>
			<Frame float="top-left" style={{ left: open ? undefined : -38, padding: '0.25rem' }} className={cls.secondaryToggle}>
				<Icon name={open ? 'panel-right-close' : 'panel-right-open'} onClick={() => setOpen(!open)} />
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
