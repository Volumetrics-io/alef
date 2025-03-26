import { deviceType } from '@/services/os';
import { Box, Button, Heading, Icon, Logo, Text } from '@alef/sys';
import { Link } from '@verdant-web/react-router';

const ComingSoonPage = () => {
	return (
		<Box full layout="center center" p>
			<Box gapped stacked p constrained align="start">
				<Box gapped align="center">
					<Logo width={60} height={60} style={{ alignSelf: 'flex-start' }} />
					<Heading level={1} style={{ fontSize: '2rem' }}>
						alef
					</Heading>
				</Box>
				<Text>Hello, {deviceType.toLowerCase()} user! A seamless Alef experience for your device is on its way, but in the meantime, open this app in an Meta Quest.</Text>
				<Button asChild color="suggested">
					<Link to="https://alef.io">
						Homepage
						<Icon name="arrow-right" />
					</Link>
				</Button>
			</Box>
		</Box>
	);
};

export default ComingSoonPage;
