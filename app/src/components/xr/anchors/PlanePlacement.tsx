import { DEBUG } from '@/services/debug';
import { usePrimaryFloorPlane } from '@/stores/roomStore';
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
		// neg Y because of all the flipping we had to do to even line these
		// things up together...
		cursorRef.current.position.set(e.localPoint.x, 0.001, -e.localPoint.y);
	};

	const onBacksideMove = (e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		cursorRef.current.visible = true;
		// Y correction not needed as we flipped again
		cursorRef.current.position.set(e.localPoint.x, 0.001, e.localPoint.y);
	};

	const onLeave = (_e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		cursorRef.current.visible = false;
	};

	const primaryFloorPlane = usePrimaryFloorPlane();
	const onClick = (e: ThreeEvent<PointerEvent>) => {
		if (!cursorRef.current) return;
		// compute the position relative to the primary floor plane (global space)
		const worldPosition = {
			x: e.point.x - (primaryFloorPlane?.origin.x ?? 0),
			y: e.point.y - (primaryFloorPlane?.origin.y ?? 0),
			z: e.point.z - (primaryFloorPlane?.origin.z ?? 0),
		};
		onPlace(worldPosition);
		cursorRef.current.visible = false;
	};

	return (
		<group rotation={[Math.PI, 0, 0]}>
			<group position={[plane.origin.x, plane.origin.y, plane.origin.z]} quaternion={[plane.orientation.x, plane.orientation.y, plane.orientation.z, plane.orientation.w]}>
				<mesh
					rotation={[Math.PI / 2, 0, 0]}
					// @ts-ignore
					pointerEvents={enabled ? 'auto' : 'none'}
					onPointerEnter={onMove as any}
					onPointerMove={onMove as any}
					onPointerLeave={onLeave as any}
					onClick={onClick as any}
					renderOrder={DEBUG ? 1 : -1}
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
							onPointerEnter={onBacksideMove as any}
							onPointerMove={onBacksideMove as any}
							onPointerLeave={onLeave as any}
							onClick={onClick as any}
							renderOrder={DEBUG ? 1 : -1}
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
