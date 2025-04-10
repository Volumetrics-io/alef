import { usePropertyStore } from '../propertyStore';

export function useIsPropertyBackedByApi() {
	return usePropertyStore((s) => s.meta.fromApi);
}
