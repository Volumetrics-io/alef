import { SimpleVector3, type SimpleQuaternion } from './rooms/state.js';

export function vec3(x: number, y: number, z: number): SimpleVector3 {
	return { x, y, z };
}

export function quat(x: number, y: number, z: number, w: number): SimpleQuaternion {
	return { x, y, z, w };
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

export function quaternionToNormal(quat: SimpleQuaternion, out: SimpleVector3 = { x: 0, y: 0, z: 0 }) {
	out.x = 2 * (quat.x * quat.z + quat.w * quat.y);
	out.y = 2 * (quat.y * quat.z - quat.w * quat.x);
	out.z = 1 - 2 * (quat.x * quat.x + quat.y * quat.y);
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
