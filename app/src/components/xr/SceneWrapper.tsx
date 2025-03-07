import { useGeoStore } from '@/stores/geoStore';
import { xrStore } from '@/stores/xrStore';
import { Box, ErrorBoundary, Icon } from '@alef/sys';
import { reversePainterSortStable } from '@pmndrs/uikit';
import { Canvas } from '@react-three/fiber';
import { OrbitHandles } from '@react-three/handle';
import { noEvents, PointerEvents, useXR, XR } from '@react-three/xr';
import { ReactNode, Suspense } from 'react';
import { PCFSoftShadowMap } from 'three';
import { XRToaster } from './XRToaster';

export interface SceneWrapperProps {
	children: ReactNode;
}

export function SceneWrapper({ children }: SceneWrapperProps) {
	const geoStore = useGeoStore();
	return (
		<Box full style={{ height: '100vh' }}>
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
						state.gl.shadowMap.autoUpdate = false;
						state.gl.shadowMap.type = PCFSoftShadowMap;
						// @ts-ignore it does
						if (window.getDigitalGoodsService !== undefined) {
							if (navigator.xr) {
								xrStore.enterAR();
							}
						}
					}}
					shadows={true}
					camera={{ position: [-5, 5, 5] }}
				>
					<XR store={xrStore}>
						<PointerEvents />
						<Suspense>{children}</Suspense>
						<NonXRCameraControls />
						<XRToaster />
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
						geoStore.fetchLocation();
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
