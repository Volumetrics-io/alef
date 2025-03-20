import { usePerformanceStore } from '@/stores/performanceStore';
import { FontFamilyProvider } from '@react-three/uikit';
import { Defaults as UIDefaults } from '@react-three/uikit-default';
export const Defaults = ({ children }: { children: React.ReactNode }) => {
	const qualityLevel = usePerformanceStore((s) => s.qualityLevel);

	const ibmPlexSans = {
		thin: './fonts/msdf/ibm-plex/IBMPlexSans-Thin.json',
		'extra-light': './fonts/msdf/ibm-plex/IBMPlexSans-ExtraLight.json',
		light: './fonts/msdf/ibm-plex/IBMPlexSans-Light.json',
		medium: './fonts/msdf/ibm-plex/IBMPlexSans-Medium.json',
		normal: './fonts/msdf/ibm-plex/IBMPlexSans-Regular.json',
		'semi-bold': './fonts/msdf/ibm-plex/IBMPlexSans-SemiBold.json',
		bold: './fonts/msdf/ibm-plex/IBMPlexSans-Bold.json',
		'extra-bold': './fonts/msdf/ibm-plex/IBMPlexSans-ExtraBold.json',
	};

	const bricolageGrotesque = {
		thin: './fonts/msdf/bricolage/BricolageGrotesque-Thin.json',
		'extra-light': './fonts/msdf/bricolage/BricolageGrotesque-ExtraLight.json',
		light: './fonts/msdf/bricolage/BricolageGrotesque-Light.json',
		medium: './fonts/msdf/bricolage/BricolageGrotesque-Medium.json',
		normal: './fonts/msdf/bricolage/BricolageGrotesque-Regular.json',
		'semi-bold': './fonts/msdf/bricolage/BricolageGrotesque-SemiBold.json',
		bold: './fonts/msdf/bricolage/BricolageGrotesque-Bold.json',
		'extra-bold': './fonts/msdf/bricolage/BricolageGrotesque-ExtraBold.json',
	};

	return (
		<UIDefaults>
			{qualityLevel === 'high' ? (
				<FontFamilyProvider ibm-plex-sans={ibmPlexSans} bricolage-grotesque={bricolageGrotesque}>
					{children}
				</FontFamilyProvider>
			) : (
				children
			)}
		</UIDefaults>
	);
};
