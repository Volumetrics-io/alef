import { RoomType } from '@alef/common';
import { BabyIcon, BedIcon, CircleIcon, CookingPotIcon, LaptopIcon, SofaIcon } from '@react-three/uikit-lucide';
import { ComponentProps, ComponentType } from 'react';

export interface LayoutIconProps extends ComponentProps<typeof CircleIcon> {
	icon: RoomType | (string & {});
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
	'living-room': SofaIcon,
	nursery: BabyIcon,
	office: LaptopIcon,
	kitchen: CookingPotIcon,
} as Record<RoomType | (string & {}), ComponentType>;

export const layoutIcons = Object.keys(mapping);
