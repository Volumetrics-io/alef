import { Button, ButtonProps, Icon } from '@alef/sys';
import { useEffect, useRef } from 'react';
import { subscribe } from 'valtio';
import { uiState } from '../uiState';
import mainUiClasses from '../VibeCodingUI.module.css';

export interface MainPanelToggleProps extends ButtonProps {}

export function MainPanelToggle(props: MainPanelToggleProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		containerRef.current = document.querySelector(`.${mainUiClasses.root}`) as HTMLDivElement;
		if (!containerRef.current) {
			console.error('MainPanelResizer: containerRef is null');
		}
	}, []);

	useEffect(() => {
		const update = () => {
			if (!containerRef.current) return;
			const container = containerRef.current;
			if (uiState.mainPanelClosed) {
				container.style.setProperty('--sidebar-override', '0px');
			} else {
				container.style.removeProperty('--sidebar-override');
			}
		};
		update();
		return subscribe(uiState, update);
	}, []);

	const toggle = () => {
		uiState.mainPanelClosed = !uiState.mainPanelClosed;
	};

	return (
		<Button {...props} onClick={toggle}>
			<Icon name="menu" />
		</Button>
	);
}
