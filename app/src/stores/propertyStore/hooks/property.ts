import { usePropertyStore } from '../propertyStore';

export function usePropertySocket() {
	return usePropertyStore((s) => s.propertySocket);
}

export function usePropertyId() {
	return usePropertyStore((s) => s.meta.propertyId);
}
