import { ROOM_TYPES, RoomType } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { LayoutIcon } from '../room/LayoutIcon';

export interface RoomTypePickerProps {
	value?: RoomType[];
	onValueChange?: (value: RoomType[]) => void;
	multiple?: boolean;
}

export function RoomTypePicker({ value = [], onValueChange, multiple }: RoomTypePickerProps) {
	return (
		<Container flexDirection="column" gap={4}>
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
					<Container width="100%" flexDirection="row" gap={20} paddingX={10}>
						<LayoutIcon icon={icon} color={colors.foreground} />
						<Text color={colors.foreground}>{icon}</Text>
					</Container>
				</Button>
			))}
		</Container>
	);
}
