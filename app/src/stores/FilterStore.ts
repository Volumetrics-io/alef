import { Attribute } from "@alef/common";
import { create } from "zustand";



export type FilterStore = {
    filters: Attribute[];
	setFilters: (filters: Attribute[]) => void;
	type:  Attribute | null;
	setType: (type: Attribute | null) => void;
};


export const useFilterStore = create<FilterStore>((set) => ({
	filters: [],
	setFilters: (filters) => set({ filters }),
	type: null,
	setType: (type) => set({ type }),
}));




