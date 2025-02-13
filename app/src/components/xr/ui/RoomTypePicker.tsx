import { ROOM_TYPES, RoomType } from '@alef/common';
import { Container } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { LayoutIcon } from '../room/LayoutIcon';

export interface RoomTypePickerProps {
	value?: RoomType[];
	onValueChange?: (value: RoomType[]) => void;
	multiple?: boolean;
}

export function RoomTypePicker({ value = [], onValueChange, multiple }: RoomTypePickerProps) {
	return (
		<Container flexDirection="row" gap={4} alignItems="center">
			{ROOM_TYPES.map((icon) => (
				<Button
					key={icon}
					onClick={() => {
						if (multiple) {
							if (value?.includes(icon)) {
								onValueChange?.(value.filter((v) => v !== icon));
							} else {
								onValueChange?.([...(value ?? []), icon]);
							}
						} else {
							onValueChange?.([icon]);
						}
					}}
					backgroundColor={value.includes(icon) ? colors.accent : undefined}
				>
					<LayoutIcon icon={icon} color={colors.foreground} />
				</Button>
			))}
		</Container>
	);
}
