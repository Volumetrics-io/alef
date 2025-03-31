import { ROOM_TYPES, RoomType } from '@alef/common';
import { Box, ToggleGroup } from '@alef/sys';
import { sentenceCase } from 'change-case';
import { DesktopLayoutIcon } from './DesktopLayoutIcon';

export interface DesktopRoomTypePickerProps {
	multiple?: boolean;
	value?: RoomType[];
	onValueChange?: (value: RoomType[]) => void;
}

export function DesktopRoomTypePicker({ multiple, value, onValueChange }: DesktopRoomTypePickerProps) {
	const groupProps = multiple
		? { type: 'multiple' as const, value, onValueChange }
		: {
				type: 'single' as const,
				value: value?.[0],
				onValueChange: (v: RoomType) => onValueChange?.([v]),
			};

	const sortedRoomTypes = [...ROOM_TYPES].sort((a, b) => a.length - b.length);

	return (
		<ToggleGroup wrap full="width" stacked={false} {...groupProps}>
			{sortedRoomTypes.map((type) => (
				<ToggleGroup.Item key={type} value={type}>
					<DesktopLayoutIcon type={type} />
					<Box>{sentenceCase(type)}</Box>
				</ToggleGroup.Item>
			))}
		</ToggleGroup>
	);
}
