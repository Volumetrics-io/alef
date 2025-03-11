import { RoomType } from '@alef/common';
import { Icon, IconName } from '@alef/sys';

export interface DesktopLayoutIconProps {
	type: RoomType | (string & {});
}

export function DesktopLayoutIcon({ type }: DesktopLayoutIconProps) {
	const mapped = mapping[type];
	if (!mapped) {
		return <Icon name="circle" />;
	}
	return <Icon name={mapped} />;
}

const mapping = {
	bedroom: 'bed',
	'living-room': 'sofa',
	nursery: 'baby',
	office: 'laptop',
	kitchen: 'cooking-pot',
} as Record<RoomType | (string & {}), IconName>;
