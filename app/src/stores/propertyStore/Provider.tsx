/* eslint-disable react-refresh/only-export-components */

import { PrefixedId } from '@alef/common';
import { createContext, ReactNode, useContext } from 'react';
import { suspend } from 'suspend-react';
import { makePropertyStore, type PropertyStore } from './propertyStore';

const PropertyStoreContext = createContext<PropertyStore | null>(null);

export const PropertyStoreProvider = ({ children, propertyId }: { children: ReactNode; propertyId: PrefixedId<'p'> | null }) => {
	const store = suspend((propId) => makePropertyStore(propId), [propertyId]);
	(window as any).propertyStore = store;
	return <PropertyStoreContext.Provider value={store}>{children}</PropertyStoreContext.Provider>;
};

export function usePropertyStoreContext() {
	const store = useContext(PropertyStoreContext);
	if (!store) {
		throw new Error('usePropertyStoreContext must be used within a PropertyStoreProvider');
	}
	return store;
}
