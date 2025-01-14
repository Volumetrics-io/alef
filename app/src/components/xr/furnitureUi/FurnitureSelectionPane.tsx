import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { formatAttribute } from '@alef/common';
import { Container, Content, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { FurnitureModel } from '../furniture/FurnitureModel';
import { FurnitureAttributeTag } from './FurnitureAttributeTag';

export function FurnitureSelectionPane() {
	const { data: furniture } = useAllFurniture();

	return (
		<Container
			flexDirection="row"
			flexWrap="wrap"
			gap={3}
			borderWidth={1}
			borderColor={colors.border}
			borderRadius={10}
			padding={5}
			backgroundColor={colors.background}
			maxWidth={1200}
		>
			{furniture.map((furnitureItem) => (
				<FurnitureSelectItem
					key={furnitureItem.id}
					furnitureItem={furnitureItem}
					onClick={() => {
						console.log('STUB: add', furnitureItem.id);
					}}
				/>
			))}
		</Container>
	);
}

function FurnitureSelectItem({ onClick, furnitureItem }: { onClick: (item: FurnitureItem) => void; furnitureItem: FurnitureItem }) {
	return (
		<Container flexDirection="column" borderWidth={1} borderColor={colors.border} borderRadius={10} padding={5} gap={5} onClick={() => onClick(furnitureItem)}>
			<Text fontSize={18} fontWeight="black">
				{furnitureItem.name}
			</Text>
			<Container flexDirection="row" gap={2} flexWrap="wrap">
				{furnitureItem.attributes.map((attr) => (
					<FurnitureAttributeTag key={formatAttribute(attr)} value={attr} />
				))}
			</Container>
			<Container backgroundColor={colors.accent} borderRadius={5} padding={4} height={120}>
				<Content>
					<FurnitureModel furnitureId={furnitureItem.id} />
				</Content>
			</Container>
		</Container>
	);
}
