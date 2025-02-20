import { ROOM_TYPES, RoomType } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { sentenceCase } from 'change-case';
import { LayoutIcon } from '../room/LayoutIcon';

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
		<Container flexDirection={direction} flexWrap={wrap ? 'wrap' : 'no-wrap'} gap={4} flexShrink={0}>
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
					backgroundColor={value.includes(roomType) ? colors.accent : undefined}
					alignItems="center"
					flexDirection="row"
					width={wrap ? 'auto' : '100%'}
					paddingY={size === 'small' ? 4 : 8}
					paddingX={size === 'small' ? 8 : 12}
					height="auto"
					gap={4}
					justifyContent="flex-start"
				>
					<LayoutIcon icon={roomType} color={colors.foreground} width={size === 'small' ? 12 : 20} height={size === 'small' ? 12 : 20} />
					<Text fontSize={size === 'small' ? 10 : 16} color={colors.foreground}>
						{sentenceCase(roomType)}
					</Text>
				</Button>
			))}
		</Container>
	);
}
