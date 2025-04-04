import { WritableDraft } from 'immer';
import { PropertyStoreState } from './propertyStore';

export type ApiCreator<T> = (globalSet: (updater: (current: WritableDraft<PropertyStoreState>) => void) => void, globalGet: () => PropertyStoreState) => T;
