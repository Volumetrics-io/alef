import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit';
import { colors } from './theme';
import { borderRadius } from '@react-three/uikit-default';
import { useState } from 'react';

export interface SelectorProps {
	direction?: 'row' | 'column';
	wrap?: boolean;
	size?: 'small' | 'medium';
}

const selectorSizeVariants = {
    small: {
        paddingY: 4,
        paddingX: 8,
        gap: 4,
    },
    medium: {
        paddingY: 8,
        paddingX: 12,
        gap: 8,
        
    },
}

export function Selector({ size = 'medium', children, ...props }: SelectorProps & ContainerProperties & { children: React.ReactNode }) {

	return (
		<Container 
        flexShrink={0}
        borderRadius={borderRadius.md}
        borderWidth={1}
        borderColor={colors.border}
        {...props}
        
        >
            <DefaultProperties
            {...selectorSizeVariants[size]} >
                {children}
            </DefaultProperties>
		</Container>
	);
}

const selectorItemSizeVariants = {
    small: {
        fontSize: 14,
        lineHeight: 20,
    },
    medium: {
        fontSize: 16,
        lineHeight: 24,
    },
}

export function SelectorItem({ wrap = false, selected, size = 'medium', children, ...props }: ContainerProperties & { wrap?: boolean, selected: boolean, size?: 'small' | 'medium', children: React.ReactNode }) {
    const [hover, setHover] = useState(false);
	return (
		<Container
            backgroundColor={selected || hover ? colors.selectionHover : undefined}
            alignItems="center"
            flexDirection="row"
            width={wrap ? 'auto' : '100%'}
            justifyContent="flex-start"
            onHoverChange={(hover) => setHover(hover)}
            {...props}
        >
            <DefaultProperties
                padding={0}
                fontFamily="ibm-plex-sans"
            {...selectorItemSizeVariants[size]}
            >
            {children}
            </DefaultProperties>
        </Container>
	);
}
