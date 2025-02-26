import { Attribute } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { useFilterStore } from '@/stores/FilterStore';

export interface FurnitureTypePickerProps {
	attributes?: Attribute[];
	direction?: 'row' | 'column';
	wrap?: boolean;
	size?: 'small' | 'medium';
}

export function FurnitureTypePicker({ attributes = [], direction = 'column', wrap, size = 'medium' }: FurnitureTypePickerProps) {

	return (
		<Container flexDirection={direction} flexWrap={wrap ? 'wrap' : 'no-wrap'} gap={4} flexShrink={0}>
            <FurnitureTypeItem key="all" attribute={{key: 'type', value: 'all'}} size={size} wrap={wrap} />
			{attributes.map((attribute) => (
				<FurnitureTypeItem key={attribute.value} attribute={attribute} size={size} wrap={wrap} />
			))}
		</Container>
	);
}

function FurnitureTypeItem({ attribute, size = 'medium', wrap = false }: { attribute: Attribute, size?: 'small' | 'medium', wrap?: boolean }) {
	const { type, setType } = useFilterStore();
	return (
		<Button
            key={attribute.value}
            onClick={() => {
                if (type?.value == attribute.value) {
                    setType(null);
                } else {
                    setType(attribute);
                }
            }}
            backgroundColor={type?.value == attribute.value ? colors.accent : undefined}
            alignItems="center"
            flexDirection="row"
            width={wrap ? 'auto' : '100%'}
            paddingY={size === 'small' ? 4 : 8}
            paddingX={size === 'small' ? 8 : 12}
            height="auto"
            gap={4}
            justifyContent="flex-start"
        >
            <Text fontSize={size === 'small' ? 10 : 16} color={colors.foreground}>
                {attribute.value[0].toUpperCase() + attribute.value.slice(1)}
            </Text>
        </Button>
	);
}
