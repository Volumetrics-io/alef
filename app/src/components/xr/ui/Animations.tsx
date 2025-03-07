import { Container, ContainerProperties } from "@react-three/uikit";
import { animated, SpringValue } from "@react-spring/three";
import { Surface } from "./Surface";
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

export const AnimatedSurface = animated(Surface);

export const usePullAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,1], [0, 3])
}

export const usePushAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,1], [0, -3])
}

export const useWiggleAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,0.25,0.5,0.75,1], [0, 1, 0, -1, 0])
}