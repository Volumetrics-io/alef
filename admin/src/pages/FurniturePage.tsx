import { AddFurniture } from '@/components/furniture/AddFurniture';
import { FurnitureBrowser } from '@/components/furniture/FurnitureBrowser';
import { Box, Heading } from '@alef/sys';

const FurniturePage = () => {
	return (
		<Box stacked>
			<Heading level={1}>Furniture</Heading>
			<Heading level={2}>New Furniture</Heading>
			<AddFurniture />
			<Heading level={2}>Browse</Heading>
			<FurnitureBrowser />
		</Box>
	);
};

export default FurniturePage;
