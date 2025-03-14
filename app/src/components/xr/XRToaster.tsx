import { Root, Text } from '@react-three/uikit';
import { CircleAlertIcon, CircleCheckIcon, HourglassIcon, InfoIcon } from '@react-three/uikit-lucide';
import { useEffect } from 'react';
import toast, { useToaster } from 'react-hot-toast';
import { BodyAnchor } from './anchors';
import { Surface } from './ui/Surface';
import { colors } from './ui/theme';

export function XRToaster({ debug }: { debug?: boolean }) {
	const { toasts, handlers } = useToaster();

	useEffect(() => {
		if (debug) {
			toast.success('Test toast', {
				duration: 30 * 1000,
			});
		}
	}, [debug]);

	return (
		<BodyAnchor follow position={[0, 0.2, 0.5]} lockY distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				{toasts.map((toast) => {
					if (typeof toast.message !== 'string') return null;

					return (
						<Surface key={toast.id} flexDirection="row" flexWrap="wrap" maxWidth={400} padding={8} onPointerOver={handlers.startPause} onPointerOut={handlers.endPause}>
							{toastIcons[toast.type] ?? <InfoIcon />}
							<Text>{toast.message}</Text>
						</Surface>
					);
				})}
			</Root>
		</BodyAnchor>
	);
}

const toastIcons = {
	error: <CircleAlertIcon color={colors.destructiveInk} />,
	info: <InfoIcon color={colors.attentionInk} />,
	success: <CircleCheckIcon color={colors.ink} />,
	loading: <HourglassIcon color={colors.ink} />,
	blank: null,
	custom: null,
};
