import { useGeoStore } from '@/stores/geoStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { xrStore } from '@/stores/xrStore';
import { Box, BoxProps, ErrorBoundary, Icon } from '@alef/sys';
import { reversePainterSortStable } from '@pmndrs/uikit';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitHandles } from '@react-three/handle';
import { noEvents, PointerEvents, useXR, XR } from '@react-three/xr';
import { Perf } from 'r3f-perf';
import { ReactNode, Suspense, useEffect } from 'react';
import { PCFSoftShadowMap } from 'three';
import { ActivePointer } from './controls/ActivePointer';
import { SplashScreen } from './ui/SplashScreen';
import { XRPerformanceManager } from './XRPerformanceManager';
import { XRToaster } from './XRToaster';

export interface SceneWrapperProps extends BoxProps {
	children: ReactNode;
}

export function SceneWrapper({ children, ...rest }: SceneWrapperProps) {
	return (
		<Box {...rest}>
			<ErrorBoundary
				fallback={
					<ErrorBoundary fallback={<div>Something went wrong</div>}>
						<Icon
							name="triangle-alert"
							style={{ width: '30vmin', height: '30vmin', transform: 'translate(-50%,-50%)', position: 'absolute', left: '50%', top: '50%' }}
							color="red"
						/>
					</ErrorBoundary>
				}
			>
				<Canvas
					events={noEvents}
					onCreated={(state) => {
						state.gl.setClearColor(0xefffff);
						state.gl.localClippingEnabled = true;
						state.gl.setTransparentSort(reversePainterSortStable);
						// @ts-ignore it does
						if (window.getDigitalGoodsService !== undefined) {
							if (navigator.xr) {
								xrStore.enterAR();
							}
						}
					}}
					shadows={{
						autoUpdate: false,
						type: PCFSoftShadowMap,
					}}
					camera={{ position: [-5, 5, 5] }}
				>
					<XR store={xrStore}>
						<PointerEvents />
						<QualityControl />
						{import.meta.env.DEV && <Perf />}
						<SplashScreen time={5} />
						<PerformanceMonitor
							bounds={(refreshRate) => {
								return [Math.max(refreshRate - 30, 45), refreshRate];
							}}
						>
							<XRPerformanceManager />
							<Suspense>{children}</Suspense>
							<NonXRCameraControls />
							<XRToaster />
							<ActivePointer />
						</PerformanceMonitor>
					</XR>
				</Canvas>
				<button
					style={{
						position: 'fixed',
						bottom: '0',
						left: '50%',
						transform: 'translateX(-50%)',
						background: 'black',
						borderRadius: '0.5rem',
						border: 'none',
						fontWeight: 'bold',
						color: 'white',
						padding: '1rem 2rem',
						cursor: 'pointer',
						fontSize: '1.5rem',
						boxShadow: '0px 0px 20px rgba(0,0,0,1)',
					}}
					onClick={() => {
						xrStore.enterAR();
						useGeoStore.getState().fetchLocation();
					}}
				>
					Enter AR
				</button>
			</ErrorBoundary>
		</Box>
	);
}

function NonXRCameraControls() {
	const isInSession = useXR((s) => !!s.session);
	return <OrbitHandles enabled={!isInSession} />;
}

function QualityControl() {
	const renderer = useThree((s) => s.gl);
	useEffect(() => {
		return usePerformanceStore.subscribe((state) => {
			const qualityLevel = state.qualityLevel;
			if (qualityLevel === 'low') {
				renderer.shadowMap.enabled = false;
			} else {
				renderer.shadowMap.enabled = true;
			}
		});
	}, [renderer]);
	return null;
}
