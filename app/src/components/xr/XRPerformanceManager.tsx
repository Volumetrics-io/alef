import { usePerformanceMonitor } from '@react-three/drei';
// import { FurnitureModelQuality } from '@alef/common';
import { useXR } from '@react-three/xr';
import { useEffect } from 'react';
export const XRPerformanceManager = () => {
	const { session } = useXR();

	// const setMaxModelQuality = usePerformanceStore((state) => state.setMaxModelQuality);

	// const onIncline = () => {
	// 	setMaxModelQuality(FurnitureModelQuality.Original);
	// };

	// const onDecline = () => {
	// 	setMaxModelQuality(FurnitureModelQuality.Low);
	// };

	useEffect(() => {
		if (!session) return;
		const framerateList = session.supportedFrameRates;
		if (!framerateList) return;

		session.updateTargetFrameRate(framerateList[0]).then(() => console.log('frame rate was applied'));
	}, [session]);

	const onChange = ({ factor }: { factor: number }) => {
		const ffr = 1 - factor;

		if (session) {
			const baseLayer = session.renderState.layers?.[0];
			if (!baseLayer) return;
			// @ts-ignore it does exist
			baseLayer.fixedFoveation = ffr;
		}
	};

	usePerformanceMonitor({
		onChange,
	});

	return null;
};
