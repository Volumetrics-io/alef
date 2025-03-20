import { Container, Root, Text } from '@react-three/uikit';
import { BodyAnchor } from './anchors';
import { Button } from './ui/Button';
import { Heading } from './ui/Heading';
import { Surface } from './ui/Surface';

export function XRError() {
	return (
		<BodyAnchor lockY position={[0, -0.25, 0.7]} follow distance={0.15}>
			<Root pixelSize={0.001} width={300} height={200}>
				<Surface flexDirection="column" gap={10} width="100%" height="100%" padding={15}>
					<Heading level={1}>Oops!</Heading>
					<Container flexGrow={1}>
						<Text>Sorry, the app crashed.</Text>
					</Container>
					<Container flexDirection="row" gap={10} justifyContent="flex-end">
						<Button onClick={() => window.location.reload()}>
							<Text>Restart</Text>
						</Button>
					</Container>
				</Surface>
			</Root>
		</BodyAnchor>
	);
}
