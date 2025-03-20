import { useEditorStore } from '@/stores/editorStore';
import { Image, Root } from '@react-three/uikit';
import { useXR } from '@react-three/xr';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { BodyAnchor } from '../anchors';

export const SplashScreen = ({ time = 5 }: { time?: number }) => {
	const { session } = useXR();
	const [splashScreen, setSplashScreen] = useEditorStore(useShallow((s) => [s.splashScreen, s.setSplashScreen]));

	useEffect(() => {
		if (splashScreen && session) {
			const timeout = setTimeout(() => {
				setSplashScreen(false);
			}, time * 1000);
			return () => clearTimeout(timeout);
		}
	}, [splashScreen, setSplashScreen, time, session]);

	if (!splashScreen || !session) return null;

	return (
		<BodyAnchor lockY position={[0, -0.25, 0.7]} follow distance={0.15}>
			<Root pixelSize={0.002} width={400} height={400}>
				<Image src="./images/landscape-rc.png" width="100%" height="100%" objectFit="cover" />
			</Root>
		</BodyAnchor>
	);
};
