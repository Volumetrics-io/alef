import { useSelectedLightPlacementId } from '@/stores/editorStore';
import { useDeleteLightPlacement, useGlobalLighting } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { Button, colors, Slider } from '@react-three/uikit-default';
import { Trash } from '@react-three/uikit-lucide';
import { Surface } from '../../ui/Surface';

export const Lighting = () => {
	const selectedLightId = useSelectedLightPlacementId();

	return (
		<Surface flexDirection="column" alignItems="center" justifyContent="center" width={350} height={300}>
			<SelectedLightPane id={selectedLightId} />
		</Surface>
	);
};

const SelectedLightPane = ({ id }: { id: PrefixedId<'lp'> | null }) => {
	const [{ intensity: globalIntensity, color: globalColor }, updateGlobal] = useGlobalLighting();

	return (
		<Container flexDirection="column" width="100%" height="100%" justifyContent="space-between" padding={20}>
			<Container flexDirection="column" gap={20} width="100%">
				<Container flexDirection="column" gap={10}>
					<Text fontSize={16} fontWeight="bold" color={colors.primary}>
						Intensity
					</Text>
					<Slider value={globalIntensity} min={0} max={2} step={0.01} onValueChange={(v) => updateGlobal({ intensity: v })} />
				</Container>
				<Container flexDirection="column" gap={10} width="100%">
					<Text fontSize={16} fontWeight="bold" color={colors.primary}>
						Warmth
					</Text>
					<Slider value={globalColor} min={0} max={10} step={0.1} onValueChange={(v) => updateGlobal({ color: v })} />
				</Container>
			</Container>

			{id && <DeleteButton id={id} />}
		</Container>
	);
};

function DeleteButton({ id }: { id: PrefixedId<'lp'> }) {
	const deleteLight = useDeleteLightPlacement(id);
	return (
		<Container flexDirection="row" gap={10} alignItems="center">
			<Button backgroundColor={colors.destructive} onClick={deleteLight}>
				<Trash color={colors.destructiveForeground} />
			</Button>
		</Container>
	);
}
