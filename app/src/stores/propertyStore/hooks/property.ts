import { usePropertyStore } from '../propertyStore';

export function usePropertySocket() {
	return usePropertyStore((s) => s.propertySocket);
}
