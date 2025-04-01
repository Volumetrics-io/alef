import { Icon } from '@alef/sys';
import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import mainUiClasses from '../DesktopUI.module.css';
import cls from './MainPanelResizer.module.css';

export interface MainPanelResizerProps {
	className?: string;
}

// note: MUST align with DestkopUI.module.css value --main-size, or drag will jump
const INITIAL_SIZE = 500;
const MIN_SIZE = 300;
const MAX_SIZE = 900;

export function MainPanelResizer({ className }: MainPanelResizerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		containerRef.current = document.querySelector(`.${mainUiClasses.main}`) as HTMLDivElement;
		if (!containerRef.current) {
			console.error('MainPanelResizer: containerRef is null');
		}
	}, []);
	const bind = useDrag(({ offset: [x] }) => {
		if (!containerRef.current) return;
		const container = containerRef.current;
		const newWidth = Math.max(MIN_SIZE, Math.min(INITIAL_SIZE + x, MAX_SIZE));
		container.style.setProperty('--main-size', `${newWidth}px`);
	});
	return (
		<div className={clsx(cls.root, className)} tabIndex={0} {...bind()}>
			<div className={clsx(cls.handle)}>
				<Icon name="grip-vertical" style={{ width: 12, height: 12 }} />
			</div>
		</div>
	);
}
