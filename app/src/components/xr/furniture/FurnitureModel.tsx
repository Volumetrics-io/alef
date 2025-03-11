import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { FurnitureModelQuality, PrefixedId } from '@alef/common';
import { ErrorBoundary, useMergedRef } from '@alef/sys';
import { Bvh, Clone, Detailed, Outlines } from '@react-three/drei';
import { forwardRef, ReactNode, Suspense, useRef } from 'react';
import { Group, Mesh } from 'three';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
	pointerEvents?: 'none' | 'auto';
	receiveShadow?: boolean;
	castShadow?: boolean;
	maxQuality?: FurnitureModelQuality;
	debugLod?: boolean;
}

interface FurnitureModelRendererProps {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
	pointerEvents?: 'none' | 'auto';
	receiveShadow?: boolean;
	castShadow?: boolean;
	quality: FurnitureModelQuality;
	transparent?: boolean;
}

const FurnitureModelRenderer = forwardRef<Group, FurnitureModelRendererProps>(function FurnitureModelRenderer(
	{ furnitureId, outline, castShadow, receiveShadow, pointerEvents = 'auto', quality, transparent = false },
	ref
) {
	const internalRef = useRef<Group>(null);
	const model = useFurnitureModel(furnitureId, quality);

	if (!model) return null;

	if (transparent) {
		model.scene.traverse((child) => {
			if (child instanceof Mesh) {
				child.material.transparent = true;
				child.material.opacity = 0;
				child.renderOrder = -1;
			}
		});
	}

	const finalRef = useMergedRef(internalRef, ref);
	return (
		<Clone
			pointerEvents={pointerEvents}
			object={model.scene as any}
			deep={true}
			castShadow={castShadow}
			receiveShadow={receiveShadow}
			ref={finalRef}
			inject={outline ? <Outlines thickness={1} color={qualityColor[quality]} /> : null}
		/>
	);
});

export const MissingModel = forwardRef<any, { onClick?: () => void; transparent?: boolean }>(function MissingModel({ onClick, transparent }, ref) {
	return (
		<mesh
			onClick={() => {
				onClick?.();
			}}
			ref={ref}
			renderOrder={transparent ? -1 : 0}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshBasicMaterial color="red" transparent={transparent} opacity={transparent ? 0 : 1} />
		</mesh>
	);
});

const PlaceholderModel = forwardRef<any, { onClick?: () => void }>(function PlaceholderModel({ onClick }, ref) {
	return (
		<mesh onClick={onClick} ref={ref}>
			<sphereGeometry args={[0.5, 8, 8]} />
			<meshBasicMaterial color="white" transparent opacity={0.5} />
		</mesh>
	);
});

export const CollisionModel = forwardRef<Group, FurnitureModelProps & { errorFallback?: ReactNode; onClick?: () => void }>(
	({ errorFallback, debugLod, onClick, ...props }, ref) => {
		return (
			<ErrorBoundary
				fallback={
					errorFallback ?? (
						// add an error boundary here as well just in case the whole furniture is missing or the network is
						// unavailable.
						<ErrorBoundary fallback={<MissingModel transparent onClick={onClick} ref={ref} />}>
							<Bvh onClick={onClick} firstHitOnly>
								{/* We likely have the original quality model, at minimum, even if others 404. */}
								<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Original} ref={ref} transparent />
							</Bvh>
						</ErrorBoundary>
					)
				}
			>
				<Bvh onClick={onClick} firstHitOnly>
					<Suspense fallback={<MissingModel transparent ref={ref} />}>
						<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Collision} ref={ref} transparent />
					</Suspense>
				</Bvh>
			</ErrorBoundary>
		);
	}
);

export const FurnitureModel = forwardRef<Group, FurnitureModelProps & { errorFallback?: ReactNode }>(
	({ errorFallback, maxQuality = FurnitureModelQuality.Original, debugLod, ...props }, ref) => {
		const isLowQuality = maxQuality === FurnitureModelQuality.Low || maxQuality === FurnitureModelQuality.Collision;

		const baseLodIndex = lods.findIndex((lod) => lod.quality === maxQuality);
		const usedLods = lods.slice(baseLodIndex);

		// FIXME: this JSX structure is kind of a mess of multiple kinds of fallbacks...
		// perhaps there's a more intuitive way to structure this behavior.
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
							<Suspense fallback={<PlaceholderModel ref={ref} />}>
								{/* We likely have the original quality model, at minimum, even if others 404. */}
								<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Original} ref={ref} />
							</Suspense>
						</ErrorBoundary>
					)
				}
			>
				{/* While loading, if we're not already loading a low quality model, show the lowest available. */}
				<Suspense
					fallback={
						isLowQuality ? (
							// if this component is rendering the lowest quality model already, just show a placeholder as it fetches.
							<PlaceholderModel ref={ref} />
						) : (
							/*
								When attempting to render the low quality fallback model, we might also not have that... show a
								generic placeholder instead to avoid fallback to the error box above and at least present
								something to the user while loading the main model.
							*/
							<ErrorBoundary fallback={<PlaceholderModel ref={ref} />}>
								{/*
									The loading state for the loading state, lol. While we load the low quality model to display
									until the higher quality one is available, we show a placeholder to let the user know something
									is coming. Even the low quality model may have a noticeable delay!
								*/}
								<Suspense fallback={<PlaceholderModel ref={ref} />}>
									<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Low} ref={ref} />
								</Suspense>
							</ErrorBoundary>
						)
					}
				>
					<Detailed distances={usedLods.map((lod) => lod.distance)}>
						{usedLods.map((lod) => (
							<FurnitureModelRenderer {...props} quality={lod.quality} outline={debugLod} ref={ref} key={lod.quality} />
						))}
					</Detailed>
				</Suspense>
			</ErrorBoundary>
		);
	}
);

const lods = [
	{ quality: FurnitureModelQuality.Original, distance: 1.5 },
	{ quality: FurnitureModelQuality.Medium, distance: 2 },
	{ quality: FurnitureModelQuality.Low, distance: 4 },
];

const qualityColor = {
	[FurnitureModelQuality.Original]: 'blue',
	[FurnitureModelQuality.Medium]: 'green',
	[FurnitureModelQuality.Low]: 'red',
	[FurnitureModelQuality.Collision]: 'purple',
};
