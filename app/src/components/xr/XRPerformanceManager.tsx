import { usePerformanceMonitor } from '@react-three/drei';
// import { usePerformanceStore } from '@/stores/performanceStore';
// import { FurnitureModelQuality } from '@alef/common';
import { useXR } from '@react-three/xr';
export const XRPerformanceManager = () => {
	const { session } = useXR();

	// const setMaxModelQuality = usePerformanceStore((state) => state.setMaxModelQuality);

	// const onIncline = () => {
	// 	setMaxModelQuality(FurnitureModelQuality.Original);
	// };

	// const onDecline = () => {
	// 	setMaxModelQuality(FurnitureModelQuality.Low);
	// };

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
