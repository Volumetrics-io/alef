import { MutableRefObject, Ref, useCallback } from 'react';

export function useMergedRef<T>(...refs: Ref<T>[]): Ref<T> {
	return useCallback((value: T) => {
		for (const ref of refs) {
			if (typeof ref === 'function') {
				ref(value);
			} else if (ref != null) {
				(ref as MutableRefObject<T>).current = value;
			}
		}
	}, refs);
}
