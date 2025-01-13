import dynamicIconImports from 'lucide-react/dynamicIconImports.js';
import { CustomIconName, customIconNames } from './customGlyphs/index.js';

// dynamic typing interop because Lucide's module is not properly classed as ESM...
// inside this package, the type must be resolved from dynamicIconImports.default, but
// outside this package it must be resolved from dynamicIconImports. I'm basically checking
// to see if TS resolved just the { default : ... } (and switching to the other version if so).
// export type LucideIconName = keyof typeof dynamicIconImports extends 'default' ? keyof typeof dynamicIconImports.default : keyof typeof dynamicIconImports;
export type LucideIconName = keyof typeof dynamicIconImports;
export const lucideIconNames = Object.keys(dynamicIconImports) as LucideIconName[];

export type IconName = LucideIconName | CustomIconName;

export const iconNames = [...customIconNames, ...lucideIconNames] as IconName[];
