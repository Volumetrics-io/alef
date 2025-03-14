import { Attribute, RoomType } from '@alef/common';
import { startTransition, useCallback } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

export type FilterStore = {
	filters: Attribute[];
	setFilters: (filters: Attribute[] | ((prev: Attribute[]) => Attribute[])) => void;
};

export const useFilterStore = create<FilterStore>()(
	immer((set) => ({
		filters: [],
		setFilters: (filters) =>
			set((v) => {
				if (typeof filters === 'function') {
					v.filters = filters(v.filters);
				} else {
					v.filters = filters;
				}
			}),
	}))
);

export function useCategoryFilter() {
	const categoryValues = useFilterStore(useShallow((s) => s.filters.filter((f) => f.key === 'category').map((f) => f.value as RoomType)));

	const updateCategories = (categories: RoomType[]) => {
		const otherFilters = useFilterStore.getState().filters.filter((f) => f.key !== 'category');
		const newCategories = categories.map((c): Attribute => ({ key: 'category', value: c }));
		const filters = [...otherFilters, ...newCategories];
		useFilterStore.setState({ filters });
	};

	return [categoryValues, updateCategories] as const;
}

export function useAllFilters() {
	return useFilterStore(useShallow((s) => s.filters));
}

export function useSetFilters() {
	const baseSetter = useFilterStore((s) => s.setFilters);
	return useCallback(
		(...params: Parameters<FilterStore['setFilters']>) => {
			startTransition(() => {
				baseSetter(...params);
			});
		},
		[baseSetter]
	);
}
