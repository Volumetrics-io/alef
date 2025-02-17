import { createContext, useContext } from 'react';

const ModeContext = createContext<{ mode: 'viewing' | 'staging' }>({ mode: 'viewing' });

export function ModeProvider({ children, value }: { children: React.ReactNode; value: 'viewing' | 'staging' }) {
	return <ModeContext.Provider value={{ mode: value }}>{children}</ModeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMode() {
	return useContext(ModeContext).mode;
}
