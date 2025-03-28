import { SimpleQuaternion, SimpleVector3 } from './rooms/index.js';

export function vec3(x: number = 0, y: number = 0, z: number = 0): SimpleVector3 {
	return { x, y, z };
}

export function quat(x: number = 0, y: number = 0, z: number = 0, w: number = 1): SimpleQuaternion {
	return { x, y, z, w };
}

export function distance(vecA: SimpleVector3, vecB: SimpleVector3) {
	// Compute the distance between two vectors in 3D space
	const dx = vecA.x - vecB.x;
	const dy = vecA.y - vecB.y;
	const dz = vecA.z - vecB.z;
	// Return the Euclidean distance
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function normalize(vec: SimpleVector3, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
	out.x = vec.x / len;
	out.y = vec.y / len;
	out.z = vec.z / len;
	return out;
}

export function copyVector(vec: SimpleVector3, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	out.x = vec.x;
	out.y = vec.y;
	out.z = vec.z;
	return out;
}

export function length(vec: SimpleVector3) {
	return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}

export function dotProduct(a: SimpleVector3, b: SimpleVector3) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function addVectors(a: SimpleVector3, b: SimpleVector3, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	out.x = a.x + b.x;
	out.y = a.y + b.y;
	out.z = a.z + b.z;
	return out;
}

export function scaleVector(vec: SimpleVector3, scale: number, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	out.x = vec.x * scale;
	out.y = vec.y * scale;
	out.z = vec.z * scale;
	return out;
}

export function crossProduct(a: SimpleVector3, b: SimpleVector3, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	// compute first in case out is a or b
	const x = a.y * b.z - a.z * b.y;
	const y = a.z * b.x - a.x * b.z;
	const z = a.x * b.y - a.y * b.x;
	out.x = x;
	out.y = y;
	out.z = z;
	return out;
}

const UP = { x: 0, y: 1, z: 0 };
export function quaternionToNormal(quat: SimpleQuaternion, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	return applyRotation(UP, quat, out);
}

export function applyRotation(vec: SimpleVector3, quat: SimpleQuaternion, out: SimpleVector3 = vec3()) {
	// Apply quaternion rotation to a vector
	// Using the formula: v' = q * v * q^-1
	const qx2 = quat.x * 2;
	const qy2 = quat.y * 2;
	const qz2 = quat.z * 2;
	const qxqx2 = quat.x * qx2;
	const qxqy2 = quat.x * qy2;
	const qxqz2 = quat.x * qz2;
	const qyqy2 = quat.y * qy2;
	const qyqz2 = quat.y * qz2;
	const qzqz2 = quat.z * qz2;
	const qwqx2 = quat.w * qx2;
	const qwqy2 = quat.w * qy2;
	const qwqz2 = quat.w * qz2;

	out.x = vec.x * (1 - (qyqy2 + qzqz2)) + vec.y * (qxqy2 - qwqz2) + vec.z * (qxqz2 + qwqy2);
	out.y = vec.x * (qxqy2 + qwqz2) + vec.y * (1 - (qxqx2 + qzqz2)) + vec.z * (qyqz2 - qwqx2);
	out.z = vec.x * (qxqz2 - qwqy2) + vec.y * (qyqz2 + qwqx2) + vec.z * (1 - (qxqx2 + qyqy2));
	return out;
}

/**
 * MUTATES normal (normalizes it)
 */
export function quaternionFromNormal(normal: { x: number; y: number; z: number }, out: SimpleQuaternion = { x: 0, y: 0, z: 0, w: 0 }) {
	// normalize normal
	normalize(normal, normal);

	const dot = dotProduct(normal, { x: 0, y: 0, z: 1 });
	if (Math.abs(dot - -1) < 0.000001) {
		out.x = 0;
		out.y = 1;
		out.z = 0;
		out.w = 0;
		return out;
	}
	if (Math.abs(dot - 1) < 0.000001) {
		out.x = 0;
		out.y = 0;
		out.z = 0;
		out.w = 1;
		return out;
	}
	const angle = Math.acos(dot);
	// only allocation needed here. cross/normalize will mutate this vec in place.
	const axis = { x: 0, y: 0, z: 1 };
	crossProduct(axis, normal, axis);
	normalize(axis, axis);
	const halfAngle = angle / 2;
	const s = Math.sin(halfAngle);
	out.x = axis.x * s;
	out.y = axis.y * s;
	out.z = axis.z * s;
	out.w = Math.cos(halfAngle);
	return out;
}
