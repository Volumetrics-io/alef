import { useEditorStore } from '@/stores/editorStore';
import { Image, Root } from '@react-three/uikit';
import { BodyAnchor } from '../anchors';

export const SplashScreen = () => {
	const show = useEditorStore((s) => s.splashScreen);

	if (!show) return null;

	return (
		<BodyAnchor lockY position={[0, -0.25, 0.7]} follow distance={0.15}>
			<Root pixelSize={0.002} width={400} height={400}>
				<Image src="./images/landscape-rc.png" width="100%" height="100%" objectFit="cover" />
			</Root>
		</BodyAnchor>
	);
};
