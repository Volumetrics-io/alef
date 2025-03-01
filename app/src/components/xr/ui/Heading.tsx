import { Text, TextProperties } from '@react-three/uikit';

type HeadingProps = {
	children: string;
	level: 0 | 1 | 2 | 3 | 4 | 5 | 6;
} & TextProperties;

const fontSizes = {
	0: 64,
	1: 32,
	2: 24,
	3: 20,
	4: 18,
	5: 16,
	6: 14,
};

export function Heading({ children, level = 0, ...props }: HeadingProps) {
	return <Text fontSize={fontSizes[level]} fontFamily="bricolage-grotesque" fontWeight="semi-bold" {...props}>{children}</Text>;
}
