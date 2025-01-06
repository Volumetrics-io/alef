// ADD NEW ICON NAMES HERE!

import { ConsoleErrorGlyph } from './ConsoleErrorGlyph.js';
import { ConsoleInfoGlyph } from './ConsoleInfoGlyph.js';
import { ConsoleWarnGlyph } from './ConsoleWarnGlyph.js';
import { DiscordGlyph } from './DiscordGlyph.js';
import { RemixGlyph } from './RemixGlyph.js';

export const customIcons = {
	remix: RemixGlyph,
	discord: DiscordGlyph,
	'console-warn': ConsoleWarnGlyph,
	'console-error': ConsoleErrorGlyph,
	'console-info': ConsoleInfoGlyph,
} as const;

export type CustomIconName = keyof typeof customIcons;

export const customIconNames = Object.keys(customIcons) as CustomIconName[];
