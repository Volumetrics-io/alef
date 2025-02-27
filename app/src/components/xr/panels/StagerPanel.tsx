import { useRescanRoom } from '@/hooks/useRescanRoom';
import { useEditorStageMode } from '@/stores/editorStore';
import { Container, FontFamilyProvider, Root } from '@react-three/uikit';
import { colors, Toggle } from '@react-three/uikit-default';
import { BoxIcon, HouseIcon, Menu, Sofa, SunIcon, X } from '@react-three/uikit-lucide';
import { Suspense, useMemo, useState } from 'react';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { DragController } from '../controls/Draggable';
import { Surface } from '../ui/Surface';
import { Furniture } from './staging/Furniture';
import { Layouts } from './staging/Layouts';
import { Lighting } from './staging/Lighting';
import { useXR } from '@react-three/xr';
import { Vector3 } from 'three';
export function StagerPanel({ onToggle }: { onToggle?: () => void }) {
	const [mode, setMode] = useEditorStageMode();
	const [isOpen, setIsOpen] = useState(false);
	const isInXR = useXR((s) => !!s.session);


	const position = useMemo(() => {
		if (!isInXR) {
			return new Vector3(-0.27, 0, 0.75);
		}
		if (isOpen) {
			return new Vector3(0, -0.15, 0.75);
		}
		return new Vector3(0, 0.2, 0.75);
	}, [isOpen, isInXR]);

	const { canRescan, rescanRoom } = useRescanRoom();



	return (
		<DraggableBodyAnchor follow={!isOpen} position={position} lockY={true} distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
			<FontFamilyProvider
						bricolage-grotesque={{
							thin: './fonts/msdf/bricolage/BricolageGrotesque-Thin.json',
							'extra-light': './fonts/msdf/bricolage/BricolageGrotesque-ExtraLight.json',
							light: './fonts/msdf/bricolage/BricolageGrotesque-Light.json',
							medium: './fonts/msdf/bricolage/BricolageGrotesque-Medium.json',
							normal: './fonts/msdf/bricolage/BricolageGrotesque-Regular.json',
							'semi-bold': './fonts/msdf/bricolage/BricolageGrotesque-SemiBold.json',
							bold: './fonts/msdf/bricolage/BricolageGrotesque-Bold.json',
							'extra-bold': './fonts/msdf/bricolage/BricolageGrotesque-ExtraBold.json',
						}}
						ibm-plex-sans={{
							thin: './fonts/msdf/ibm-plex/IBMPlexSans-Thin.json',
							'extra-light': './fonts/msdf/ibm-plex/IBMPlexSans-ExtraLight.json',
							light: './fonts/msdf/ibm-plex/IBMPlexSans-Light.json',
							medium: './fonts/msdf/ibm-plex/IBMPlexSans-Medium.json',
							normal: './fonts/msdf/ibm-plex/IBMPlexSans-Regular.json',
							'semi-bold': './fonts/msdf/ibm-plex/IBMPlexSans-SemiBold.json',
							bold: './fonts/msdf/ibm-plex/IBMPlexSans-Bold.json',
							'extra-bold': './fonts/msdf/ibm-plex/IBMPlexSans-ExtraBold.json',
						}}
					>
				<Surface flexGrow={0} flexShrink={0} marginX="auto">
					<Toggle
						onClick={() => {
							setMode(null);
							setIsOpen(!isOpen);
							onToggle?.();
						}}
					>
						{isOpen ? <X color={colors.primary} /> : <Menu color={colors.primary} />}
					</Toggle>
					<Container display={isOpen ? 'flex' : 'none'} flexDirection="row" alignItems={'center'} gap={10}>
						<Toggle checked={mode === 'layout'} onClick={() => setMode('layout')}>
							<HouseIcon color={colors.primary} />
						</Toggle>
						<Toggle checked={mode === 'furniture'} onClick={() => setMode('furniture')}>
							<Sofa color={colors.primary} />
						</Toggle>
						<Toggle checked={mode === 'lighting'} onClick={() => setMode('lighting')}>
							<SunIcon color={colors.primary} />
						</Toggle>
						{canRescan && (
							<Toggle onClick={() => rescanRoom()}>
								<BoxIcon color={colors.primary} />
							</Toggle>
						)}
					</Container>
				</Surface>
				{isOpen && (
					<>
						{mode === 'lighting' && <Lighting />}
						{mode === 'furniture' && (
							<Suspense>
								<Furniture />
							</Suspense>
						)}
						{mode === 'layout' && <Layouts />}
						{mode !== null && (
							<DragController>
								<Container flexDirection="row" width="70%" gap={10} alignItems="center">
									<Container backgroundColor={colors.background} height={15} borderRadius={10} borderColor={colors.border} borderWidth={0.5} flexGrow={1} />
								</Container>
							</DragController>
						)}
					</>
				)}
			</FontFamilyProvider>
			</Root>
		</DraggableBodyAnchor>
	);
}
