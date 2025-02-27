import { Attribute } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { useFilterStore } from '@/stores/FilterStore';
import { colors } from './theme';
import { useState } from 'react';
import { Selector, SelectorItem } from './Selector';
export interface FurnitureTypePickerProps {
	attributes?: Attribute[];
	direction?: 'row' | 'column';
	wrap?: boolean;
	size?: 'small' | 'medium';
}

export function FurnitureTypePicker({ attributes = [], direction = 'column', wrap, size = 'medium' }: FurnitureTypePickerProps) {
    const { type, setType } = useFilterStore();

	return (
		<Selector flexWrap={wrap ? 'wrap' : 'no-wrap'} flexDirection={direction} size={size}>
            <SelectorItem key="all"
            onClick={() => {
                if (type?.value == 'all') {
                    setType(null);
                } else {
                    setType({key: 'type', value: 'all'});
                }
            }}
            selected={type?.value == 'all'}
            >
                <Text>
                    All
                </Text>
            </SelectorItem>
			{attributes.map((attribute) => (
				<SelectorItem key={attribute.value}
                onClick={() => {
                    if (type?.value == attribute.value) {
                        setType(null);
                    } else {
                        setType(attribute);
                    }
                }}
                selected={type?.value == attribute.value}
                >
                    <Text>
                        {attribute.value[0].toUpperCase() + attribute.value.slice(1)}
                    </Text>
                </SelectorItem>
			))}
		</Selector>
	);
}
