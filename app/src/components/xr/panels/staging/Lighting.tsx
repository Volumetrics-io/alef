import { useLightStore } from "@/stores/lightStore";
import { Container, Text } from "@react-three/uikit"
import { Button, colors, Slider } from "@react-three/uikit-default";
import { Trash } from "@react-three/uikit-lucide";
import { useEffect } from "react";
import { useState } from "react";

export const Lighting = () => {
    const { selectedLightId } = useLightStore();

    const [lightID, setLightID] = useState<string | null>(null);

    useEffect(() => {
        if (selectedLightId == null) {
            setLightID(null);
            return;
        }
        setLightID(selectedLightId);
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

            <SelectedLightPane id={lightID} />
        </Container>
    );
};

const SelectedLightPane = ( {id}: {id?: string} ) => {

    const { globalIntensity, globalColor, setGlobalIntensity, setGlobalColor, lightDetails, setLightDetails } = useLightStore();


    const handleIntensityChange = (value: number) => {
        setGlobalIntensity(value);
    }

    const handleWarmthChange = (value: number) => {
        setGlobalColor(value);
    }

    const handleDelete = () => {
        if (!id) return;
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
                <Container flexDirection="column" gap={10}>
                    <Text fontSize={16} fontWeight="bold" color={colors.primary}>Intensity</Text>
                    <Slider value={globalIntensity} min={0} max={2} step={0.01} onValueChange={handleIntensityChange} />
                </Container>
                <Container flexDirection="column" gap={10} width="100%">
                    <Text fontSize={16} fontWeight="bold" color={colors.primary}>Warmth</Text>
                    <Slider value={globalColor} min={0} max={10} step={0.1} onValueChange={handleWarmthChange} />
                </Container>
            </Container>

            {id && (
                <Container flexDirection="row" gap={10} alignItems="center">
                    <Button backgroundColor={colors.destructive} onClick={handleDelete}>
                        <Trash color={colors.destructiveForeground} />
                    </Button>
                </Container>
            )}

        </Container>
    );
}