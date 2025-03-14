import { StageMode, useDetailsOpen, useEditorStageMode } from '@/stores/editorStore';
import { Box, Frame, Icon, Tabs } from '@alef/sys';
import clsx from 'clsx';
import { ReactNode, Suspense } from 'react';
import cls from './DesktopUI.module.css';
import { DesktopFurnitureEditor } from './furniture/DesktopFurnitureEditor';
import { DesktopOnlineFurniturePicker } from './furniture/DesktopOnlineFurniturePicker';
import { DesktopLayoutEditor } from './layouts/DesktopLayoutEditor';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';
import { DesktopLightEditor } from './lighting/DesktopLightEditor';
import { DesktopLightsMainEditor } from './lighting/DesktopLightsMainEditor';

export interface DesktopUIProps {
	children?: ReactNode;
}

export function DesktopUI({ children }: DesktopUIProps) {
	const [mode, setMode] = useEditorStageMode();

	return (
		<Box asChild className={cls.root}>
			<Tabs value={mode || 'layouts'} onValueChange={(m) => setMode(m as StageMode)}>
				<DesktopUIMain />
				<Box className={cls.content}>{children}</Box>
				<DesktopUISecondary />
			</Tabs>
		</Box>
	);
}

function DesktopUIMain() {
	return (
		<Box className={cls.main} stacked>
			<Tabs.List>
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
					<DesktopLayoutsPicker />
				</Suspense>
			</Tabs.Content>
			<Tabs.Content value="furniture">
				<Suspense>
					<DesktopOnlineFurniturePicker />
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
