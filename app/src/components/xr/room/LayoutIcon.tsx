import { BabyIcon, BedIcon, CircleIcon, CookingPotIcon, LaptopIcon, SofaIcon } from '@react-three/uikit-lucide';
import { ComponentProps } from 'react';

export interface LayoutIconProps extends ComponentProps<typeof CircleIcon> {
	icon: string;
}

export function LayoutIcon({ icon, ...rest }: LayoutIconProps) {
	const Comp = mapping[icon];

	if (!Comp) {
		return <CircleIcon {...rest} />;
	}

	return <Comp {...rest} />;
}

const mapping = {
	bedroom: BedIcon,
	livingroom: SofaIcon,
	nursery: BabyIcon,
	office: LaptopIcon,
	kitchen: CookingPotIcon,
} as Record<string, any>;

export const layoutIcons = Object.keys(mapping);
