import { DEBUG } from '@/services/debug';
import { RoomPlaneData, SimpleVector3 } from '@alef/common';
import { PointerEvent } from '@pmndrs/pointer-events';
import { ThreeEvent } from '@react-three/fiber';
import { ReactNode, Suspense, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { Cursor } from '../ui/Cursor';

export interface PlanePlacementProps {
	plane: RoomPlaneData;
	onPlace: (worldPosition: SimpleVector3) => void;
	// children are rendered within the placement cursor, use for a preview
	// item, etc.
	children?: ReactNode;
	enabled?: boolean;
	bothSides?: boolean;
}

export function PlanePlacement({ plane, onPlace, children, enabled, bothSides }: PlanePlacementProps) {
	const cursorRef = useRef<Group>(null);

	const onMove = (e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		cursorRef.current.visible = true;
		const flipY = e.target.userData.flipY;
		// neg Y because of all the flipping we had to do to even line these
		// things up together...
		cursorRef.current.position.set(e.localPoint.x, 0.001, e.localPoint.y * (flipY ? -1 : 1));
	};

	const onLeave = (_e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		cursorRef.current.visible = false;
	};

	const onClick = (e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		const flipY = e.target.userData.flipY;
		console.log(plane.origin, e.localPoint);
		// compute the position relative to the primary floor plane (global space)
		const worldPosition = {
			x: plane.origin.x + e.localPoint.x,
			y: -plane.origin.y + 0.001,
			// NOTE: this double flip logic is an arbitrary fix based on experimentation.
			// I think the "bothSides" aspect is actually more to do with where bothSides
			// is used (ceiling) than the fact that it's 'both sides' and might mean we
			// have to flip again for planes oriented downward? idk. who knows what happens
			// if we tried walls...
			z: plane.origin.z + (flipY ? -1 : 1) * (bothSides ? -1 : 1) * e.localPoint.y,
		};
		onPlace(worldPosition);
		cursorRef.current.visible = false;
	};

	return (
		<group rotation={[Math.PI, 0, 0]} visible={enabled}>
			<group position={[plane.origin.x, plane.origin.y, plane.origin.z]} quaternion={[plane.orientation.x, plane.orientation.y, plane.orientation.z, plane.orientation.w]}>
				<mesh
					rotation={[Math.PI / 2, 0, 0]}
					// @ts-ignore
					pointerEvents={enabled ? 'auto' : 'none'}
					onPointerEnter={onMove as any}
					onPointerMove={onMove as any}
					onPointerLeave={onLeave as any}
					onClick={onClick as any}
					renderOrder={DEBUG ? 1 : 0}
					userData={{ flipY: true }}
				>
					<planeGeometry args={plane.extents} />
					<meshBasicMaterial color="yellow" colorWrite={DEBUG && enabled} transparent={!DEBUG} />
				</mesh>
				{bothSides && (
					<group rotation={[Math.PI, 0, 0]}>
						<mesh
							rotation={[Math.PI / 2, 0, 0]}
							// @ts-ignore
							pointerEvents={enabled ? 'auto' : 'none'}
							onPointerEnter={onMove as any}
							onPointerMove={onMove as any}
							onPointerLeave={onLeave as any}
							onClick={onClick as any}
							renderOrder={DEBUG ? 1 : 0}
							userData={{ flipY: false }}
						>
							<planeGeometry args={plane.extents} />
							<meshBasicMaterial color="yellow" colorWrite={DEBUG && enabled} transparent={!DEBUG} />
						</mesh>
					</group>
				)}
				<group rotation={[Math.PI, 0, 0]}>
					<Cursor visible={false} ref={cursorRef} position={[0, 0.1, 0]}>
						<Suspense>{children}</Suspense>
					</Cursor>
				</group>
			</group>
			{enabled && DEBUG && <arrowHelper args={[new Vector3(0, 1, 0), new Vector3(), 0.5, 'yellow']} />}
		</group>
	);
}
