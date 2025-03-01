import { useEditorStageMode, useSelectedLightPlacementId } from '@/stores/editorStore';
import { useDeleteLightPlacement, useGlobalLighting } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { Container } from '@react-three/uikit';
import { ArrowLeftIcon, SunIcon, Trash } from '@react-three/uikit-lucide';
import { Surface } from '../../ui/Surface';
import { Button } from '../../ui/Button';
import { Heading } from '../../ui/Heading';
import { Slider } from '../../ui/Slider';

export const Lighting = () => {
	const selectedLightId = useSelectedLightPlacementId();

	return (
		<Surface flexDirection="column" width={500} height={420}>
			<SelectedLightPane id={selectedLightId} />
		</Surface>
	);
};

const SelectedLightPane = ({ id }: { id: PrefixedId<'lp'> | null }) => {
	const [, setMode] = useEditorStageMode();
	const [{ intensity: globalIntensity, color: globalColor }, updateGlobal] = useGlobalLighting();

	return (
		<Container flexDirection="column" width="100%" height="100%" padding={10} gap={10}>
			<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
				<SunIcon width={20} height={20} />
				<Heading level={3}>
					Lighting
				</Heading>
			</Container>
			<Container flexDirection="column" gap={50} flexGrow={1}>
				<Container flexDirection="column" gap={10}>
					<Heading level={4}>
						Intensity
					</Heading>
					<Slider value={globalIntensity} min={0} max={2} step={0.01} onValueChange={(v) => updateGlobal({ intensity: v })} />
				</Container>
				<Container flexDirection="column" gap={10} width="100%">
					<Heading level={4}>
						Warmth
					</Heading>
					<Slider value={globalColor} min={0} max={10} step={0.1} onValueChange={(v) => updateGlobal({ color: v })} />
				</Container>
			</Container>
			<Container flexDirection="row" gap={4} width="100%" paddingRight={6} justifyContent="space-between">
				<Button onClick={() => setMode('furniture')}>
					<ArrowLeftIcon />
				</Button>
				{id && <DeleteButton id={id} />}
			</Container>
		</Container>
	);
};

function DeleteButton({ id }: { id: PrefixedId<'lp'> }) {
	const deleteLight = useDeleteLightPlacement(id);
	return (
		<Container flexDirection="row" gap={10} alignItems="center">
			<Button variant="destructive" onClick={deleteLight}>
				<Trash />
			</Button>
		</Container>
	);
}
