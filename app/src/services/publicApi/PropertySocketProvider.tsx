import { PrefixedId } from '@alef/common';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { connectToSocket, PropertySocket } from './socket';

const PropertySocketContext = createContext<PropertySocket | null>(null);

export function usePropertySocket() {
	const value = useContext(PropertySocketContext);
	return value || null;
}

export const PropertySocketProvider = ({ children, propertyId }: { children: ReactNode; propertyId: PrefixedId<'p'> }) => {
	const [value, setValue] = useState<PropertySocket | null>(null);

	useEffect(() => {
		connectToSocket(propertyId).then(setValue);
	}, [propertyId]);
	// cleanup upon change of socket reference
	useEffect(() => {
		return () => {
			value?.close();
		};
	}, [value]);

	// until socket is connected, don't render
	if (!value) {
		return null;
	}
	return <PropertySocketContext.Provider value={value}>{children}</PropertySocketContext.Provider>;
};
