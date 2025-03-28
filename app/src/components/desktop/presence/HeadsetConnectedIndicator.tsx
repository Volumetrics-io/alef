import { Frame } from '@alef/sys';
import { useIsHeadsetConnected } from './hooks';

export interface HeadsetConnectedIndicatorProps {}

export function HeadsetConnectedIndicator({}: HeadsetConnectedIndicatorProps) {
	const isHeadsetConnected = useIsHeadsetConnected();

	return (
		<Frame rounded p="squeeze" layout="center center" gapped>
			<div
				style={{
					width: '1rem',
					height: '1rem',
					borderRadius: '9999px',
					backgroundColor: isHeadsetConnected ? 'var(--happy-press)' : 'var(--yummy-press)',
				}}
			/>
			{isHeadsetConnected ? <span>Headset connected</span> : <span>No headset connected</span>}
		</Frame>
	);
}
