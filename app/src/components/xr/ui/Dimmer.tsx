import { Container, ContainerProperties } from "@react-three/uikit";
import { colors } from "./theme";
import { isDarkMode } from "@pmndrs/uikit";

export const Dimmer = ({ children, ...props }: ContainerProperties & { children?: React.ReactNode }) => {

	return (
        <Container flexDirection="column" 
					backgroundColor={colors.dimmed}
					backgroundOpacity={isDarkMode.value ? 0.5 : 0.15}
					borderRadius={10}
					width="100%" 
					height="100%" 
					positionType="absolute" 
					positionTop={0} 
					positionLeft={0} 
					positionRight={0} 
					positionBottom={0}
					justifyContent="center"
					alignItems="center"
					zIndexOffset={10}
					padding={10}
					{...props}
					>
            {children}
        </Container>
	);
};
