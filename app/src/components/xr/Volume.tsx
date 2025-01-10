import { useFrame, useThree } from '@react-three/fiber';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { Group, Material, Matrix4, Mesh, Plane, PlaneHelper, Vector3 } from 'three';

import { PlaneAnchorContext } from './anchors/PlaneAnchor.js';

interface VolumeProps {
	dimensions?: [number, number, number];
	children?: React.ReactNode;
	debug?: boolean;
}

export function Volume({ dimensions = [0, 1, 0], children, debug = false }: VolumeProps) {
	const plane = useContext(PlaneAnchorContext);
	const groupRef = useRef<Group>(null);
	const { scene } = useThree();

	// Create planes once
	const clippingPlanesRef = useRef<Plane[]>([
		new Plane(new Vector3(0, 1, 0)), // bottom
		new Plane(new Vector3(0, -1, 0)), // top
		new Plane(new Vector3(1, 0, 0)), // left
		new Plane(new Vector3(-1, 0, 0)), // right
		new Plane(new Vector3(0, 0, 1)), // front
		new Plane(new Vector3(0, 0, -1)), // back
	]);

	useEffect(() => {
		if (!groupRef.current) return;

		groupRef.current.traverse((child) => {
			if (child instanceof Mesh) {
				if (Array.isArray(child.material)) {
					child.material.forEach((material: Material) => {
						material.clippingPlanes = clippingPlanesRef.current;
						material.clipIntersection = false;
						material.needsUpdate = true;
					});
				} else {
					child.material.clippingPlanes = clippingPlanesRef.current;
					child.material.clipIntersection = false;
					child.material.needsUpdate = true;
				}
			}
		});
	}, [groupRef]); // Only run when the group changes

	const { minX, maxX, minZ, maxZ } = useMemo(() => {
		if (plane) {
			let minX = Infinity,
				maxX = -Infinity,
				minZ = Infinity,
				maxZ = -Infinity;

			for (const point of plane.polygon) {
				minX = Math.min(minX, point.x);
				maxX = Math.max(maxX, point.x);
				minZ = Math.min(minZ, point.z);
				maxZ = Math.max(maxZ, point.z);
			}

			return { minX, maxX, minZ, maxZ };
		}

		// Default dimensions if no plane is provided
		const halfWidth = (dimensions[0] > 0 ? dimensions[0] : 1) / 2;
		const halfDepth = (dimensions[2] > 0 ? dimensions[2] : 1) / 2;
		return {
			minX: -halfWidth,
			maxX: halfWidth,
			minZ: -halfDepth,
			maxZ: halfDepth,
		};
	}, [plane, dimensions]);

	// Create reusable vectors and matrix at component level
	const refs = useRef({
		p1: new Vector3(),
		p2: new Vector3(),
		p3: new Vector3(),
		worldMatrix: new Matrix4(),
	});

	// Helper to update a plane using reusable vectors
	const updatePlane = (plane: Plane, x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, x3: number, y3: number, z3: number) => {
		refs.current.p1.set(x1, y1, z1).applyMatrix4(refs.current.worldMatrix);
		refs.current.p2.set(x2, y2, z2).applyMatrix4(refs.current.worldMatrix);
		refs.current.p3.set(x3, y3, z3).applyMatrix4(refs.current.worldMatrix);
		plane.setFromCoplanarPoints(refs.current.p1, refs.current.p2, refs.current.p3);
	};

	useFrame(() => {
		if (!groupRef.current) return;
		refs.current.worldMatrix = groupRef.current.matrixWorld;

		// Update all planes
		updatePlane(
			clippingPlanesRef.current[0],
			minX,
			0,
			minZ, // bottom
			minX,
			0,
			maxZ,
			maxX,
			0,
			minZ
		);

		updatePlane(
			clippingPlanesRef.current[1],
			minX,
			dimensions[1],
			minZ, // top
			maxX,
			dimensions[1],
			minZ,
			minX,
			dimensions[1],
			maxZ
		);

		updatePlane(
			clippingPlanesRef.current[2],
			minX,
			0,
			minZ, // left
			minX,
			dimensions[1],
			minZ,
			minX,
			0,
			maxZ
		);

		updatePlane(
			clippingPlanesRef.current[3],
			maxX,
			0,
			minZ, // right
			maxX,
			0,
			maxZ,
			maxX,
			dimensions[1],
			minZ
		);

		updatePlane(
			clippingPlanesRef.current[4],
			minX,
			0,
			minZ, // front
			maxX,
			0,
			minZ,
			minX,
			dimensions[1],
			minZ
		);

		updatePlane(
			clippingPlanesRef.current[5],
			minX,
			0,
			maxZ, // back
			minX,
			dimensions[1],
			maxZ,
			maxX,
			0,
			maxZ
		);
	});

	useEffect(() => {
		if (groupRef.current && debug) {
			// Remove existing helpers from the scene
			scene.children = scene.children.filter((child) => !(child instanceof PlaneHelper));

			clippingPlanesRef.current.forEach((plane) => {
				const helper = new PlaneHelper(plane, 1, 0xff0000);
				scene.add(helper);
			});
		}
	}, [debug, scene]);

	return <group ref={groupRef}>{children}</group>;
}
