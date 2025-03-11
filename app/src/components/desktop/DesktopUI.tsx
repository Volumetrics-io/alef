import { StageMode, useEditorStageMode } from '@/stores/editorStore';
import { Box, Icon, Tabs } from '@alef/sys';
import { ReactNode, Suspense } from 'react';
import cls from './DesktopUI.module.css';
import { DesktopFurnitureEditor } from './furniture/DesktopFurnitureEditor';
import { DesktopOnlineFurniturePicker } from './furniture/DesktopOnlineFurniturePicker';
import { DesktopLayoutEditor } from './layouts/DesktopLayoutEditor';
import { DesktopLayoutsPicker } from './layouts/DesktopLayoutsPicker';

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
			<Tabs.Content value="lighting"></Tabs.Content>
		</Box>
	);
}

function DesktopUISecondary() {
	return (
		<Box className={cls.secondary}>
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
			<Tabs.Content value="lighting"></Tabs.Content>
		</Box>
	);
}
