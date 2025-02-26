import { PrefixedId } from '@alef/common';
import { create } from 'zustand';

export const useFurnitureStore = create<FurnitureStore>((set) => ({
	focusedFurniture: null,
	needsScreenshots: [],
	setNeedsScreenshots: (furnitureIds: PrefixedId<'f'>[]) => set({ needsScreenshots: furnitureIds }),
}));

export interface FurnitureStore {
	focusedFurniture: PrefixedId<'f'> | null;
	needsScreenshots: PrefixedId<'f'>[];
	setNeedsScreenshots: (furnitureIds: PrefixedId<'f'>[]) => void;
}

export function addNeedsScreenshot(furnitureId: PrefixedId<'f'>) {
	const store = useFurnitureStore.getState();

	useFurnitureStore.setState({ needsScreenshots: [...store.needsScreenshots, furnitureId], focusedFurniture: furnitureId });
}

export function removeNeedsScreenshot(furnitureId: PrefixedId<'f'>) {
	const store = useFurnitureStore.getState();

    const needsScreenshots = store.needsScreenshots.filter((id) => id !== furnitureId);
    const focusedFurniture = needsScreenshots.length > 0 ? needsScreenshots[0] : null;

	console.log('removing needs screenshot', furnitureId);
	console.log('needs screenshots', needsScreenshots[0]);
	console.log('focused furniture', focusedFurniture);


	useFurnitureStore.setState({
		needsScreenshots,
		focusedFurniture,
	});
}