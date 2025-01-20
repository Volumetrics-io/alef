import { LightDetails, useLightStore } from "@/stores/lightStore";
import { Container, Text } from "@react-three/uikit"
import { Button, colors, Slider } from "@react-three/uikit-default";
import { Trash } from "@react-three/uikit-lucide";
import { useEffect } from "react";
import { useState } from "react";

export const Lighting = () => {
    const { selectedLightId, lightDetails } = useLightStore();
    const [light, setLight] = useState<LightDetails | null>(null);

    useEffect(() => {
        if (selectedLightId == null) {
            setLight(null);
            return;
        }
        setLight(lightDetails[selectedLightId]);
    }, [selectedLightId]);

    return (
        <Container flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            width={350} height={300}
            gap={3}
			borderWidth={1}
			borderColor={colors.border}
			borderRadius={10}
			padding={5}
			backgroundColor={colors.background}
        >
            {!light && (
                <Text color={colors.primary}>place or select a light</Text>
            )}
            {light && (
                <SelectedLightPane id={selectedLightId} />
            )}
        </Container>
    );
};

const SelectedLightPane = ( {id}: {id: string} ) => {

    const { setLightDetails, lightDetails } = useLightStore();

    const light = lightDetails[id];

    if (!light) {
        return null;
    }

    const handleIntensityChange = (value: number) => {
        lightDetails[id].intensity = value;
        setLightDetails({ ...lightDetails });
    }

    const handleWarmthChange = (value: number) => {
        lightDetails[id].color = value;
        setLightDetails({ ...lightDetails });
    }

    const handleDelete = () => {
        delete lightDetails[id];
        setLightDetails({ ...lightDetails });
    }

    return (
        <Container 
            flexDirection="column" 
            width="100%" 
            height="100%"
            justifyContent="space-between"
            padding={20}
        >
            <Container flexDirection="column" gap={20} width="100%">
                <Container flexDirection="row" gap={10} alignItems="center">
                    <Text fontSize={16} fontWeight="bold" color={colors.primary}>Intensity</Text>
                    <Slider value={light.intensity} min={0} max={2} step={0.01} onValueChange={handleIntensityChange} />
                </Container>
                <Container flexDirection="column" gap={10} width="100%">
                    <Text fontSize={16} fontWeight="bold" color={colors.primary}>Warmth</Text>
                    <Slider value={light.color} min={0} max={10} step={0.1} onValueChange={handleWarmthChange} />
                </Container>
            </Container>

            <Container flexDirection="row" gap={10} alignItems="center">
                <Button backgroundColor={colors.destructive} onClick={handleDelete}>
                    <Trash color={colors.destructiveForeground} />
                </Button>
            </Container>

        </Container>
    );
}