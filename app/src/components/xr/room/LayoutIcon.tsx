import { BabyIcon, BedIcon, CircleIcon, CookingPotIcon, LaptopIcon, SofaIcon } from '@react-three/uikit-lucide';

export interface LayoutIconProps {
	icon: string;
}

export function LayoutIcon({ icon }: LayoutIconProps) {
	const Comp = mapping[icon];

	if (!Comp) {
		return <CircleIcon />;
	}

	return <Comp />;
}

const mapping = {
	bedroom: BedIcon,
	livingroom: SofaIcon,
	nursery: BabyIcon,
	office: LaptopIcon,
	kitchen: CookingPotIcon,
} as Record<string, any>;

export const layoutIcons = Object.keys(mapping);
