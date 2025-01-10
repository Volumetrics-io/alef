import React, { useRef, useEffect } from 'react';
import { Group, Box3, Quaternion, Vector3, Mesh, Euler } from 'three';
import { PlaneLabel } from './PlaneAnchor';
import { useEnvironmentContext } from '../Environment';

function setWorldRotation(object: Group, rotationEuler: Euler): void {
    if (!(rotationEuler instanceof Euler)) {
      throw new Error("rotationEuler must be an instance of THREE.Euler.");
    }
  
    const desiredWorldQuaternion = new Quaternion().setFromEuler(rotationEuler);
  
    if (object.parent) {
      const parentWorldQuaternion = new Quaternion();
      object.parent.getWorldQuaternion(parentWorldQuaternion);
  
      // Convert the desired world quaternion to the object's local space
      const localQuaternion = parentWorldQuaternion.invert().multiply(desiredWorldQuaternion);
      object.quaternion.copy(localQuaternion);
    } else {
      // If no parent, directly set the world rotation
      object.quaternion.copy(desiredWorldQuaternion);
    }
  
    // Update the object's world matrix
    object.updateMatrixWorld();
  }

const checkFit = (targetSize: Vector3, planes: Mesh[], padding: number): Mesh | null => {
    const planeBBox = new Box3()
    const planeSize = new Vector3();
    const tempPlaneQuaternion = new Quaternion();

    let fit = 10000;
    let diff = 0;
    let fitPlane: Mesh | null = null;
    for (const plane of planes) {
        tempPlaneQuaternion.copy(plane.quaternion);
        plane.quaternion.set(0, 0, 0, 1);
        planeBBox.setFromObject(plane);
        plane.quaternion.copy(tempPlaneQuaternion);
        planeBBox.getSize(planeSize);
        diff = planeSize.x - (targetSize.x + padding);
        if ( diff > 0 && diff < fit) {
            fit = diff;
            fitPlane = plane;
        }
    }
    return fitPlane;
}

export const SnapAnchor = ({ label, children, padding = 0 }: { label: PlaneLabel; children: React.ReactNode; padding: number }) => {
    const targetRef = useRef<Group>(null);
    const planes = useEnvironmentContext()?.[label];
    const planeQuaternion = new Quaternion();
    const targetQuaternion = new Quaternion();
    const parentWorldQuaternion = new Quaternion();
    const worldPosition = new Vector3();
    const localPosition = new Vector3();
    const size = new Vector3();

    useEffect(() => {
            // Introduce a slight delay to ensure plane transforms are populated
            const timer = setTimeout(() => {
                
                if (planes && planes.length > 0 && targetRef.current) {
                    targetQuaternion.copy(targetRef.current.quaternion);
                    setWorldRotation(targetRef.current, new Euler(0, 0, 0));
                    // Compute bounding box of the group
                    const bbox = new Box3().setFromObject(targetRef.current, true);
                    targetRef.current.quaternion.copy(targetQuaternion);
                    
                    bbox.getSize(size);
                    const plane = checkFit(size, planes, padding);

                    if (!plane) {
                        return;
                    }

                    const depth = size.z;                    
                    // Get the plane's world quaternion
                    plane.getWorldQuaternion(planeQuaternion);
                    
                    // Compute the plane's Y-axis in world space
                    const planeYAxis = new Vector3(0, 1, 0).applyQuaternion(planeQuaternion).normalize(); // Y-axis of the plane

                    // Create a quaternion that rotates the group's Z-axis to align with the plane's Y-axis
                    const alignmentQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), planeYAxis);

                    // If the object has a parent
                    if (targetRef.current.parent) {
                        // Calculate the local quaternion by inverting the parent's world quaternion
                        targetRef.current.parent.getWorldQuaternion(parentWorldQuaternion);
                        targetQuaternion.copy(parentWorldQuaternion.invert().multiply(alignmentQuaternion));
        
                        targetRef.current.quaternion.copy(targetQuaternion);
                    } else {
                        // If no parent, directly set the world quaternion
                        targetRef.current.quaternion.copy(alignmentQuaternion);
                    }

                    // Get the plane's world position
                    plane.getWorldPosition(worldPosition);

                    // Convert plane's world position to the group's parent local space
                    if (targetRef.current.parent) {
                        localPosition.copy(targetRef.current.parent.worldToLocal(worldPosition));
                    } else {
                        localPosition.copy(worldPosition);
                    }

                    const offset = new Vector3(0, 0, -depth / 2);
                    localPosition.add(offset.applyQuaternion(targetRef.current.quaternion));

                    localPosition.y = 0;

                    targetRef.current.position.copy(localPosition);

                }
            }, 10); 

            return () => clearTimeout(timer);
    }, [planes, targetRef]);

    return (
        <group ref={targetRef}>
            {children}
        </group>
    )
}