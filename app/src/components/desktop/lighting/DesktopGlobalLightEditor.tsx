import { getLightColor } from '@/components/xr/lighting/getLightColor';
import { useGlobalLighting } from '@/stores/roomStore';
import { Box, Heading, Label, Slider, Text } from '@alef/sys';

export function DesktopGlobalLightEditor() {
	const [globalLighting, updateGlobalLighting] = useGlobalLighting();

	return (
		<Box stacked gapped>
			<Label>Intensity</Label>
			<Slider
				min={0}
				max={2}
				step={0.01}
				value={[globalLighting.intensity]}
				onValueChange={([v]) => updateGlobalLighting({ intensity: v }, { localOnly: true })}
				onValueCommit={([v]) => updateGlobalLighting({ intensity: v })}
			/>
			<Label>Color</Label>
			<Slider
				min={0}
				max={10}
				step={0.1}
				value={[globalLighting.color]}
				onValueChange={([v]) => updateGlobalLighting({ color: v }, { localOnly: true })}
				onValueCommit={([v]) => updateGlobalLighting({ color: v })}
				rangeColor={getLightColor(globalLighting.color)}
			/>
		</Box>
	);
}
