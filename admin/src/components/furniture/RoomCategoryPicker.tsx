import { ROOM_TYPES, RoomType } from '@alef/common';
import { Box, Button, Icon, IconName, Text } from '@alef/sys';

export interface RoomCategoryPickerProps {
	value?: RoomType[];
	onValueChange?: (value: RoomType[]) => void;
	multiple?: boolean;
}

export function RoomCategoryPicker({ value = [], onValueChange, multiple }: RoomCategoryPickerProps) {
	return (
		<Box gapped>
			{ROOM_TYPES.map((roomType) => (
				<Button
					key={roomType}
					onClick={() => {
						if (multiple) {
							if (value?.includes(roomType)) {
								onValueChange?.(value.filter((v) => v !== roomType));
							} else {
								onValueChange?.([...(value ?? []), roomType]);
							}
						} else {
							onValueChange?.([roomType]);
						}
					}}
					color={value.includes(roomType) ? 'suggested' : 'default'}
				>
					<Icon name={mapping[roomType]} />
					<Text>{roomType}</Text>
				</Button>
			))}
		</Box>
	);
}

const mapping = {
	bedroom: 'bed',
	'living-room': 'sofa',
	nursery: 'baby',
	office: 'laptop',
} as Record<RoomType | (string & {}), IconName>;
