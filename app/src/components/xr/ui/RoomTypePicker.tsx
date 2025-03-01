import { ROOM_TYPES, RoomType } from '@alef/common';
import { Text } from '@react-three/uikit';
import { sentenceCase } from 'change-case';
import { LayoutIcon } from '../room/LayoutIcon';
import { Selector, SelectorItem } from './Selector';
import { colors } from './theme';

export interface RoomTypePickerProps {
	value?: RoomType[];
	onValueChange?: (value: RoomType[]) => void;
	multiple?: boolean;
	direction?: 'row' | 'column';
	wrap?: boolean;
	size?: 'small' | 'medium';
}

export function RoomTypePicker({ value = [], onValueChange, multiple, direction = 'column', wrap, size = 'medium' }: RoomTypePickerProps) {
	return (
		<Selector flexDirection={direction} flexWrap={wrap ? 'wrap' : 'no-wrap'} size={size}>
			{ROOM_TYPES.map((roomType) => (
				<SelectorItem
					wrap={wrap}
					key={roomType}
					size={size}
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
					selected={value.includes(roomType)}
				>
					<LayoutIcon icon={roomType} width={size === 'small' ? 12 : 20} height={size === 'small' ? 12 : 20} />
					<Text>
						{sentenceCase(roomType)}
					</Text>
				</SelectorItem>
			))}
		</Selector>
	);
}
