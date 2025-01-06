import { createContext } from 'react';

export const ButtonContext = createContext<{ loading: boolean }>({ loading: false });
