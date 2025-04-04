import { useShadowControls } from '@/hooks/useShadowMapUpdate';
import { useFurnitureDetails, useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { usePerformanceStore } from '@/stores/performanceStore';
import { FurnitureModelQuality, PrefixedId, RANKED_FURNITURE_MODEL_QUALITIES } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Bvh, Clone, CloneProps, Outlines, Preload } from '@react-three/drei';
import { ThreeElements, ThreeEvent } from '@react-three/fiber';
import { forwardRef, ReactNode, Suspense, useCallback } from 'react';
import { DoubleSide, Group, Mesh } from 'three';
import { SimpleBox, SimpleBoxProps } from './SimpleBox';

type MeshProps = ThreeElements['mesh'];
export interface FurnitureModelProps extends Omit<MeshProps, 'args'> {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
	receiveShadow?: boolean;
	castShadow?: boolean;
	quality?: FurnitureModelQuality;
	debugLod?: boolean;
}

interface FurnitureModelRendererProps extends Omit<CloneProps, 'object' | 'inject'> {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
	quality: FurnitureModelQuality;
	transparent?: boolean;
	colorWrite?: boolean;
}

const FurnitureModelRenderer = forwardRef<Group, FurnitureModelRendererProps>(function FurnitureModelRenderer(
	{ furnitureId, outline, castShadow, receiveShadow, pointerEvents = 'auto', quality, transparent = false, colorWrite = true },
	ref
) {
	const model = useFurnitureModel(furnitureId, quality);
	const shadowControls = useShadowControls();

	if (!model) return null;

	if (transparent || colorWrite === false) {
		model.scene.traverse((child) => {
			if (child instanceof Mesh) {
				child.material.transparent = true;
				child.material.opacity = 0.5;
				child.material.colorWrite = colorWrite;
				child.renderOrder = -1;
			}
		});
	}

	return (
		<Clone
			// @ts-ignore pointerEvents is not typed
			pointerEvents={pointerEvents}
			object={model.scene as any}
			deep
			castShadow={castShadow}
			receiveShadow={receiveShadow}
			ref={ref}
			inject={outline ? <Outlines thickness={1} color={qualityColor[quality]} /> : null}
			onUpdate={() => {
				// update shadow map when this model loads in
				shadowControls.update();
			}}
		/>
	);
});

export const MissingModel = forwardRef<any, { onClick?: () => void; transparent?: boolean; pointerEvents?: 'none' | 'auto' }>(function MissingModel(
	{ onClick, transparent, pointerEvents },
	ref
) {
	return (
		<mesh
			onClick={() => {
				onClick?.();
			}}
			ref={ref}
			pointerEvents={pointerEvents}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshBasicMaterial color="red" transparent={transparent} colorWrite={!transparent} />
		</mesh>
	);
});

interface PlaceholderModelProps extends Omit<SimpleBoxProps, 'size'> {
	furnitureId: PrefixedId<'f'>;
}
const PlaceholderModel = forwardRef<any, PlaceholderModelProps>(function PlaceholderModel({ onClick, furnitureId, transparent, pointerEvents }, ref) {
	const { data } = useFurnitureDetails(furnitureId);
	// data contains metadata about measured dimensions, which we can use to show a more accurate placeholder.
	const hasDimensions = data?.measuredDimensionsX && data?.measuredDimensionsY && data?.measuredDimensionsZ;
	const dimensions: [number, number, number] = hasDimensions ? [data.measuredDimensionsX!, data.measuredDimensionsY!, data.measuredDimensionsZ!] : [1, 1, 1];

	return <SimpleBox pointerEvents={pointerEvents} transparent={transparent} size={dimensions} position={[0, dimensions[1] / 2, 0]} onClick={onClick} ref={ref} />;
});

export const SimpleCollisionModel = forwardRef<Mesh, FurnitureModelProps & { errorFallback?: ReactNode; onClick?: () => void; enabled?: boolean; colorWrite?: boolean }>(
	({ errorFallback, debugLod, onClick, pointerEvents = 'auto', enabled, colorWrite = false, ...props }, ref) => {
		const { data } = useFurnitureDetails(props.furnitureId);
		// data contains metadata about measured dimensions, which we can use to show a more accurate placeholder.
		const hasDimensions = data?.measuredDimensionsX && data?.measuredDimensionsY && data?.measuredDimensionsZ;
		const dimensions: [number, number, number] = hasDimensions ? [data.measuredDimensionsX!, data.measuredDimensionsY!, data.measuredDimensionsZ!] : [1, 1, 1];
		return (
			<mesh {...props} pointerEvents={enabled === false ? 'none' : pointerEvents} position={[0, dimensions[1] / 2, 0]} onClick={onClick} renderOrder={1000} ref={ref}>
				<boxGeometry args={dimensions} />
				<meshBasicMaterial colorWrite={colorWrite} depthWrite={false} color="red" side={DoubleSide} />
			</mesh>
		);
	}
);

export const CollisionModel = forwardRef<Group, FurnitureModelProps & { errorFallback?: ReactNode; onClick?: () => void; enabled?: boolean; colorWrite?: boolean }>(
	({ errorFallback, debugLod, onClick, pointerEvents = 'auto', enabled, colorWrite = false, ...props }, ref) => {
		const stopPropagation = useCallback((e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
		}, []);
		return (
			<ErrorBoundary
				fallback={
					errorFallback ?? (
						// default error fallback is a box
						<PlaceholderModel furnitureId={props.furnitureId} transparent onClick={enabled ? onClick : undefined} ref={ref} pointerEvents={pointerEvents} />
					)
				}
			>
				<Suspense fallback={<PlaceholderModel furnitureId={props.furnitureId} transparent ref={ref} pointerEvents={pointerEvents} />}>
					<Preload all />
					<Bvh
						onPointerOver={stopPropagation}
						onPointerOut={stopPropagation}
						onPointerEnter={stopPropagation}
						onPointerLeave={stopPropagation}
						onClick={onClick}
						firstHitOnly
						maxDepth={30}
						maxLeafTris={5}
					>
						<FurnitureModelRenderer
							pointerEvents={enabled === false ? 'none' : pointerEvents}
							furnitureId={props.furnitureId}
							quality={FurnitureModelQuality.Collision}
							ref={ref}
							transparent
							colorWrite={colorWrite}
						/>
					</Bvh>
				</Suspense>
			</ErrorBoundary>
		);
	}
);

export const FurnitureModel = forwardRef<Group, FurnitureModelProps & { errorFallback?: ReactNode }>(
	({ errorFallback, quality: preferredMaxQuality = FurnitureModelQuality.Original, debugLod, ...props }, ref) => {
		const renderQuality = usePerformanceStore((state) => state.qualityLevel);
		const globalMaxQuality = renderQuality == 'high' ? FurnitureModelQuality.Original : FurnitureModelQuality.Low;
		// to cap the model quality, we use the smallest of the two: [preferredMaxQuality, globalMaxQuality].
		// for example, this component may be rendered with a preferred max of Original, but if the global
		// limit is at Medium, this will be Medium.
		const maxQualityRank = Math.min(RANKED_FURNITURE_MODEL_QUALITIES.indexOf(preferredMaxQuality), RANKED_FURNITURE_MODEL_QUALITIES.indexOf(globalMaxQuality));
		const maxQuality = RANKED_FURNITURE_MODEL_QUALITIES[maxQualityRank];

		return (
			// a last line of defense against missing models and network errors, this fallback
			// attempts to render the original model, using a placeholder as a loader, and if
			// even that model cannot be fetched, it falls back to an obvious error visualizer.
			<ErrorBoundary
				fallback={
					errorFallback ?? (
						// add an error boundary here as well just in case the whole furniture is missing or the network is
						// unavailable.
						<ErrorBoundary fallback={<MissingModel ref={ref} />}>
							{/* While the original model loads, show some kind of geometry to let the user know there's something here. */}
							<Suspense fallback={<PlaceholderModel furnitureId={props.furnitureId} ref={ref} />}>
								{/* We likely have the original quality model, at minimum, even if others 404. */}
								<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Original} ref={ref} />
							</Suspense>
						</ErrorBoundary>
					)
				}
			>
				<Suspense fallback={<PlaceholderModel furnitureId={props.furnitureId} ref={ref} pointerEvents={props.pointerEvents} />}>
					<Preload all />
					<FurnitureModelRenderer {...props} quality={maxQuality} ref={ref} />
				</Suspense>
			</ErrorBoundary>
		);
	}
);

const qualityColor = {
	[FurnitureModelQuality.Original]: 'blue',
	[FurnitureModelQuality.Medium]: 'green',
	[FurnitureModelQuality.Low]: 'red',
	[FurnitureModelQuality.Collision]: 'purple',
};
