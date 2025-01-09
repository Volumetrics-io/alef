import { AddFurniture } from '@/components/furniture/AddFurniture';
import { FurnitureBrowser } from '@/components/furniture/FurnitureBrowser';
import { Box, Button, Frame, Heading, Icon } from '@alef/sys';
import { Link } from '@verdant-web/react-router';

const FurniturePage = () => {
	return (
		<Box stacked full align="start" gapped>
			<Box gapped align="center">
				<Button asChild color="ghost">
					<Link to="/">
						<Icon name="arrow-left" />
					</Link>
				</Button>
				<Heading level={1}>Furniture</Heading>
			</Box>
			<Heading level={2}>New Furniture</Heading>
			<Frame p>
				<AddFurniture />
			</Frame>
			<Heading level={2}>Browse</Heading>
			<Box full p>
				<FurnitureBrowser />
			</Box>
		</Box>
	);
};

export default FurniturePage;
