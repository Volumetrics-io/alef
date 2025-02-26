import * as React from 'react'
import { Group, Vector3 } from 'three'
import { ThreeElements, useFrame, useThree } from '@react-three/fiber'

export type BillboardProps = Omit<ThreeElements['group'], 'ref'> & {
  follow?: boolean
  lockX?: boolean
  lockY?: boolean
  lockZ?: boolean
}

/**
 * Wraps children in a billboarded group. Sample usage:
 *
 * ```js
 * <Billboard>
 *   <Text>hi</Text>
 * </Billboard>
 * ```
 */
export const Billboard = /* @__PURE__ */ React.forwardRef<
  Group,
  BillboardProps
>(function Billboard({ children, follow = true, lockX = false, lockY = false, lockZ = false, ...props }, fref) {
  const groupRef = React.useRef<Group>(null!)
  const camera = useThree((state) => state.camera)
  
  // Create reusable vectors to avoid garbage collection
  const cameraWorldPos = React.useRef(new Vector3())
  const objectWorldPos = React.useRef(new Vector3())
  const directionToCamera = React.useRef(new Vector3())
  
  useFrame(() => {
    if (!follow || !groupRef.current) return
    
    // Get camera position in world space
    camera.getWorldPosition(cameraWorldPos.current)
    
    // Get object position in world space
    groupRef.current.getWorldPosition(objectWorldPos.current)
    
    // Transform camera position to local space of the parent
    const localCameraPos = cameraWorldPos.current.clone()
    if (groupRef.current.parent) {
      groupRef.current.parent.worldToLocal(localCameraPos)
    }
    
    // Get object position in local space
    const localObjectPos = groupRef.current.position.clone()
    
    // Calculate direction from object to camera in local space
    directionToCamera.current.subVectors(localCameraPos, localObjectPos).normalize()
    
    // Store original rotation values for locked axes
    const originalRotation = {
      x: groupRef.current.rotation.x,
      y: groupRef.current.rotation.y,
      z: groupRef.current.rotation.z
    }
    
    // Calculate rotation angles based on direction to camera
    if (!lockY) {
      // Y-axis rotation (horizontal)
      groupRef.current.rotation.y = Math.atan2(
        directionToCamera.current.x,
        directionToCamera.current.z
      )
    }
    
    if (!lockX) {
      // X-axis rotation (vertical)
      const horizontalLength = Math.sqrt(
        directionToCamera.current.z * directionToCamera.current.z +
        directionToCamera.current.x * directionToCamera.current.x
      )
      groupRef.current.rotation.x = -Math.atan2(
        directionToCamera.current.y,
        horizontalLength
      )
    }
    
    if (!lockZ) {
      // Z-axis rotation (roll)
      // This is typically not needed for billboarding, but included for completeness
      // We'll keep it at 0 by default
      groupRef.current.rotation.z = 0
    }
    
    // Restore locked axes to their original values
    if (lockX) groupRef.current.rotation.x = originalRotation.x
    if (lockY) groupRef.current.rotation.y = originalRotation.y
    if (lockZ) groupRef.current.rotation.z = originalRotation.z
  })

  React.useImperativeHandle(fref, () => groupRef.current, [])
  
  return (
    <group ref={groupRef} {...props}>
      {children}
    </group>
  )
})