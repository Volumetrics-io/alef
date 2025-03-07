import { Container, ContainerProperties } from "@react-three/uikit";
import { animated } from "@react-spring/three";

export type AnimationProps = {
    from: ContainerProperties
    to: ContainerProperties
}

function StaticContainer({ children, ...props }: ContainerProperties & { children: React.ReactNode }) {
	return (
		<Container {...props}>
			{children}
		</Container>
	);
}
export const AnimatedContainer = animated(StaticContainer);