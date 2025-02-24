import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { FurnitureModelQuality, PrefixedId } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Clone, Detailed, Outlines } from '@react-three/drei';
import { forwardRef, ReactNode, Suspense } from 'react';
import { Group } from 'three';

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
}

const FurnitureModelRenderer = forwardRef<Group, FurnitureModelRendererProps>(function FurnitureModelRenderer(
	{ furnitureId, outline, castShadow, receiveShadow, pointerEvents = 'auto', quality },
	ref
) {
	const model = useFurnitureModel(furnitureId, quality);

	if (!model) return null;

	return (
		<Clone
			//@ts-expect-error - prop not typed
			pointerEvents={pointerEvents}
			object={model.scene as any}
			deep={true}
			castShadow={castShadow}
			receiveShadow={receiveShadow}
			ref={ref}
			inject={outline ? <Outlines thickness={1} color={qualityColor[quality]} /> : null}
		/>
	);
});

export const FurnitureModel = forwardRef<Group, FurnitureModelProps & { errorFallback?: ReactNode }>(
	({ errorFallback, maxQuality = FurnitureModelQuality.Original, debugLod, ...props }, ref) => {
		const isLowQuality = maxQuality === FurnitureModelQuality.Low || maxQuality === FurnitureModelQuality.Collision;

		const baseLodIndex = lods.findIndex((lod) => lod.quality === maxQuality);
		const usedLods = lods.slice(baseLodIndex);

		return (
			<ErrorBoundary
				fallback={
					errorFallback ?? (
						// add an error boundary here as well just in case the whole furniture is missing or the network is
						// unavailable.
						<ErrorBoundary fallback={null}>
							{/* We likely have the original quality model, at minimum, even if others 404. */}
							<FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Original} />
						</ErrorBoundary>
					)
				}
			>
				{/* While loading, if we're not already loading a low quality model, show the lowest available. */}
				<Suspense fallback={isLowQuality ? null : <FurnitureModelRenderer {...props} quality={FurnitureModelQuality.Low} />}>
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
	{ quality: FurnitureModelQuality.Original, distance: 0 },
	{ quality: FurnitureModelQuality.Medium, distance: 0.5 },
	{ quality: FurnitureModelQuality.Low, distance: 3 },
];

const qualityColor = {
	[FurnitureModelQuality.Original]: 'blue',
	[FurnitureModelQuality.Medium]: 'green',
	[FurnitureModelQuality.Low]: 'red',
	[FurnitureModelQuality.Collision]: 'purple',
};
