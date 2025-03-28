import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';
import { useDeleteLightPlacement, useGlobalLighting, useLightPlacementIds } from '@/stores/roomStore';
import { useEditorMode, useIsSelected, useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { ArrowLeftIcon, LightbulbIcon, SunIcon, Trash } from '@react-three/uikit-lucide';
import { useCallback, useRef } from 'react';
import { getLightColor } from '../../lighting/getLightColor';
import { Button } from '../../ui/Button';
import { Heading } from '../../ui/Heading';
import { Selector, SelectorItem } from '../../ui/Selector';
import { Slider } from '../../ui/Slider';
import { Surface } from '../../ui/Surface';

export const Lighting = () => {
	return (
		<Surface flexDirection="column" width={500} height={420} padding={10}>
			<LightPane />
		</Surface>
	);
};

const LightPane = () => {
	const [, setMode] = useEditorMode();
	const [{ intensity: globalIntensity, color: globalColor }, updateGlobal] = useGlobalLighting();
	const lightColorRef = useRef(globalColor);
	const lightIntensityRef = useRef(globalIntensity);
	const lightIds = useLightPlacementIds();

	const updateShadowMap = useShadowMapUpdate();

	const updateIntensity = useCallback(() => {
		updateGlobal({ intensity: lightIntensityRef.current });
		updateShadowMap();
	}, [updateGlobal, updateShadowMap]);

	const updateColor = useCallback(() => {
		updateGlobal({ color: lightColorRef.current });
		updateShadowMap();
	}, [updateGlobal, updateShadowMap]);

	return (
		<Container flexDirection="column" width="100%" height="100%" padding={10} gap={10}>
			<Container marginX="auto" flexDirection="row" gap={4} alignItems="center" justifyContent="center">
				<SunIcon width={20} height={20} />
				<Heading level={3}>Lighting</Heading>
			</Container>
			<Container flexDirection="column" gap={8} flexShrink={1}>
				<Container flexDirection="column" gap={4} flexGrow={1} flexShrink={0}>
					<Heading level={4}>Brightness</Heading>
					<Slider defaultValue={lightIntensityRef.current} min={0} max={2} step={0.01} onValueChange={(v) => (lightIntensityRef.current = v)} onPointerUp={updateIntensity} />
				</Container>
				<Container flexDirection="column" gap={4} width="100%" flexGrow={1} flexShrink={0}>
					<Heading level={4}>Warmth</Heading>
					<Slider
						defaultValue={lightColorRef.current}
						color={getLightColor(lightColorRef.current)}
						min={0}
						max={10}
						step={0.1}
						onValueChange={(v) => (lightColorRef.current = v)}
						onPointerUp={updateColor}
					/>
				</Container>
				<Container flexDirection="column" gap={4} width="100%" flexShrink={2}>
					<Heading level={4}>Lights</Heading>
					<Selector
						size="small"
						display={lightIds.length > 0 ? 'flex' : 'none'}
						flexDirection="column"
						backgroundColor={undefined}
						width="100%"
						flexShrink={2}
						paddingRight={10}
						overflow="scroll"
					>
						{lightIds.map((id) => (
							<LightItem key={id} id={id} />
						))}
					</Selector>
				</Container>
			</Container>
			<Container flexDirection="row" width="100%">
				<Button onClick={() => setMode('furniture')}>
					<ArrowLeftIcon />
				</Button>
			</Container>
		</Container>
	);
};

function LightItem({ id }: { id: PrefixedId<'lp'> }) {
	const isSelected = useIsSelected(id);
	const select = useSelect();

	return (
		<SelectorItem flexShrink={0} justifyContent="space-between" onClick={() => select(id)} selected={isSelected}>
			<Container flexDirection="row" gap={10} alignItems="center">
				<Text>Ceiling Light</Text>
				<LightbulbIcon />
			</Container>
			<DeleteButton id={id} visible={isSelected} />
		</SelectorItem>
	);
}

function DeleteButton({ id, visible }: { id: PrefixedId<'lp'>; visible?: boolean }) {
	const deleteLight = useDeleteLightPlacement(id);
	return (
		<Container flexDirection="row" gap={10} flexShrink={0} alignItems="center" visibility={visible ? 'visible' : 'hidden'}>
			<Button
				variant="destructive"
				onClick={() => {
					if (!visible) return;
					deleteLight();
				}}
				visibility={visible ? 'visible' : 'hidden'}
			>
				<Trash visibility={visible ? 'visible' : 'hidden'} />
			</Button>
		</Container>
	);
}
