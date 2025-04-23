import { Icon } from '@alef/sys';
import { useDrag } from '@use-gesture/react';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { subscribe, useSnapshot } from 'valtio';
import { uiState } from '../uiState';
import mainUiClasses from '../VibeCodingUI.module.css';
import cls from './MainPanelResizer.module.css';

export interface MainPanelResizerProps {
	className?: string;
}

const INITIAL_SIZE = uiState.sidebarSize;
const MIN_SIZE = 400;
const MAX_SIZE = 900;

export function MainPanelResizer({ className }: MainPanelResizerProps) {
	const selfRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const closed = useSnapshot(uiState).mainPanelClosed;

	useEffect(() => {
		containerRef.current = document.querySelector(`.${mainUiClasses.root}`) as HTMLDivElement;
		if (!containerRef.current) {
			console.error('MainPanelResizer: containerRef is null');
		}
	}, []);

	const bind = useDrag(({ offset: [x] }) => {
		const newWidth = Math.max(MIN_SIZE, Math.min(INITIAL_SIZE + x, MAX_SIZE));
		uiState.sidebarSize = newWidth;
	});

	useEffect(() => {
		function updateSize() {
			if (!containerRef.current) return;
			const container = containerRef.current;
			container.style.setProperty('--sidebar-size', `${uiState.sidebarSize}px`);
		}
		updateSize();
		return subscribe(uiState, updateSize);
	}, []);

	if (closed) return null;

	return (
		<div
			className={clsx(cls.root, className)}
			tabIndex={0}
			ref={selfRef}
			style={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 'var(--sidebar-override, var(--sidebar-size))',
				transform: `translateX(-50%)`,
			}}
			{...bind()}
		>
			<div className={clsx(cls.handle)}>
				<Icon name="grip-vertical" style={{ width: 12, height: 12 }} />
			</div>
		</div>
	);
}
