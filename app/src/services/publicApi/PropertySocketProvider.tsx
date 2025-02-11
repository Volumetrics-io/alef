import { PrefixedId } from '@alef/common';
import { Spinner } from '@alef/sys';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { connectToSocket, PropertySocket } from './socket';

const PropertySocketContext = createContext<PropertySocket | null>(null);

export function usePropertySocket() {
	const value = useContext(PropertySocketContext);
	if (value === null) {
		throw new Error('usePropertySocket must be used within a PropertySocketProvider');
	}
	return value;
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

	// until socket is connected, show spinner
	if (!value) {
		return <Spinner />;
	}
	return <PropertySocketContext.Provider value={value}>{children}</PropertySocketContext.Provider>;
};
