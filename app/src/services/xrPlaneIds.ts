import { PrefixedId } from '@alef/common';

/**
 * Since XRPlanes don't have any exposed ID, we need to keep track of them ourselves.
 * When we assign an ID to a processed plane, we also store it in this map for
 * quick lookup later.
 */
export const xrPlaneIdMap = new WeakMap<XRPlane, PrefixedId<'rp'>>();
