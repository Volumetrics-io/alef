import { useDebugStore } from '@/stores/debugStore';
import { useEditorStore } from '@/stores/editorStore';
import { usePlanesStore } from '@/stores/planesStore';
import { RoomStore } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import type RAPIER from '@dimforge/rapier3d-compat';
import { KinematicCharacterController, QueryFilterFlags } from '@dimforge/rapier3d-compat';
import { HandleOptions } from '@react-three/handle';
import { RefObject } from 'react';
import { Quaternion, Vector3 } from 'three';
import { getMostIntentionalPlaneSnappedMovement } from './xrPlaneTools';

type HandleState = Parameters<NonNullable<HandleOptions<unknown>['apply']>>[0];

export type DragControllerUpdateFrame = {
	handleState: HandleState;
};

export class DragController {
	private controller: KinematicCharacterController;
	private unsubscribes: (() => void)[] = [];

	#isDragging = false;
	get isDragging() {
		return this.#isDragging;
	}

	constructor(
		private id: PrefixedId<'fp'>,
		private world: RAPIER.World,
		private bodyRef: RefObject<RAPIER.RigidBody>,
		roomStore: RoomStore,
		private config: {
			offset?: number;
			disablePlaneSnap?: boolean;
			onDragEnd?: (transform: { position: Vector3; rotation: Quaternion }) => void;
		}
	) {
		this.controller = world.createCharacterController(config.offset ?? 0.005);
		// can 'climb' any slope
		this.controller.setMaxSlopeClimbAngle(Math.PI * 2);
		this.controller.setSlideEnabled(true);
		// we handle snapping manually against all planes.
		this.controller.disableSnapToGround();

		// subscribe to changes in position from the store and update as long as it
		// won't interfere with the current drag operation
		this.unsubscribes.push(
			roomStore.subscribe(
				(s) => (s.viewingLayoutId ? s.layouts[s.viewingLayoutId].furniture[id] : undefined),
				(placement) => {
					if (!placement) return;
					if (this.isDragging) return;
					console.log('update from store', placement);
					this.#body?.setTranslation(placement.position, false);
					this.#body?.setRotation(placement.rotation, false);
				},
				// runs upon subscription so we get the initial value
				{ fireImmediately: true }
			)
		);
	}

	get #body() {
		return this.bodyRef.current;
	}

	get #collider() {
		return this.#body?.collider(0);
	}

	get #position() {
		return this.#body?.translation() ?? new Vector3();
	}

	get #rotation() {
		return this.#body?.rotation() ?? new Quaternion();
	}

	dispose = () => {
		this.world.removeCharacterController(this.controller);
		this.unsubscribes.forEach((u) => u());
		this.unsubscribes = [];
	};

	#updateTmpTransform = {
		position: new Vector3(),
		rotation: new Quaternion(),
	};
	update = (handleState: HandleState) => {
		this.#isDragging = true;

		// order matters; translation must be applied before rotation
		this.#applyTranslation(handleState);
		this.#applyRotation(handleState);

		if (handleState.last) {
			this.#isDragging = false;
			// update the store with the final position
			this.#updateTmpTransform.position.copy(this.#body!.translation());
			this.#updateTmpTransform.rotation.copy(this.#body!.rotation());
			console.debug('drag end', this.#updateTmpTransform);
			this.config.onDragEnd?.(this.#updateTmpTransform);
		}
	};

	#applyTranslationTmpVector = new Vector3();
	#applyTranslation = (handleState: HandleState) => {
		if (!handleState.delta || !this.#body) return;
		// apply object rotation to the delta since the handle is also rotated within it
		// this.#applyTranslationTmpVector.copy(handleState.delta.position).applyQuaternion(this.#rotation);
		this.#applyTranslationTmpVector.copy(handleState.delta.position);

		useDebugStore.setState({
			rawDragDelta: this.#applyTranslationTmpVector,
			rawDragStart: handleState.initial.position,
		});

		// snap to plane if applicable
		if (!this.config.disablePlaneSnap) {
			this.#applyTranslationTmpVector.copy(this.#snapToPlane(this.#applyTranslationTmpVector));
		}
		// determine adjusted movement based on obstructions and collisions
		if (this.#collider) {
			this.controller.computeColliderMovement(this.#collider, this.#applyTranslationTmpVector, QueryFilterFlags.EXCLUDE_SENSORS);
			// retrieve the computed movement
			this.#applyTranslationTmpVector.copy(this.controller.computedMovement());
		}
		// apply the movement to the target object
		this.#applyTranslationTmpVector.add(this.#position);
		this.#body?.setTranslation(this.#applyTranslationTmpVector, true);
	};

	#snapToPlaneTmpVector = new Vector3();
	#snapToPlane = (delta: Vector3) => {
		if (!this.#body) return delta;

		const candidates = this.#getPlaneCandidates(this.id);
		if (!candidates.length) return delta;

		// determine normals of potential snap planes. filter any planes that aren't registered
		// with the plane store system, which won't have a normal.
		const normals = candidates.map(this.#getPlaneNormal).filter((v): v is Vector3 => !!v);
		// find the most intentional plane based on the direction of movement -- i.e. which
		// plane is the movement most aligned with?
		const planeIndex = getMostIntentionalPlaneSnappedMovement(delta, normals);
		if (planeIndex === -1) return delta;

		const snappedPlane = candidates[planeIndex];

		// get the closest point on the plane to the target point
		this.#snapToPlaneTmpVector.addVectors(this.#position, delta);
		this.#snapToPlaneTmpVector.copy(this.#getClosestPlanePoint(snappedPlane, this.#snapToPlaneTmpVector));
		this.#snapToPlaneTmpVector.sub(this.#position);

		return this.#snapToPlaneTmpVector;
	};

	#getPlaneCandidates = (placementId: PrefixedId<'fp'>) => {
		return useEditorStore.getState().stickyIntersections[placementId] ?? [];
	};

	#getPlaneNormal = (planeId: string) => {
		return usePlanesStore.getState().getPlaneInfo(planeId)?.normal;
	};

	#getClosestPlanePoint = (planeId: string, targetPoint: Vector3) => {
		return usePlanesStore.getState().getClosestPoint(planeId, targetPoint);
	};

	#applyRotationTmpQuaternion = new Quaternion();
	#applyRotation = (handleState: HandleState) => {
		if (!handleState.delta || !this.#body) return;
		// kinematic controller does not accommodate rotation, we just assign it
		this.#applyRotationTmpQuaternion.copy(this.#rotation).premultiply(handleState.delta.quaternion);
		this.#body?.setRotation(this.#applyRotationTmpQuaternion, true);
	};
}
