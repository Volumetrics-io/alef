import { AddFurniture } from '@/components/furniture/AddFurniture';
import { BulkFurnitureDelete } from '@/components/furniture/BulkFurnitureDelete';
import { BulkFurnitureUploader } from '@/components/furniture/BulkFurnitureUploader';
import { FurnitureBrowser } from '@/components/furniture/FurnitureBrowser';
import { FurnitureProcessingQueue } from '@/components/furniture/FurnitureProcessingQueue';
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
			<Box gapped>
				<Box p stacked gapped>
					<BulkFurnitureUploader />
					<BulkFurnitureDelete />
				</Box>
				<Frame p>
					<AddFurniture />
				</Frame>
			</Box>
			<Heading level={2}>Browse</Heading>
			<Box full p>
				<FurnitureBrowser />
			</Box>
			<FurnitureProcessingQueue />
		</Box>
	);
};

export default FurniturePage;
