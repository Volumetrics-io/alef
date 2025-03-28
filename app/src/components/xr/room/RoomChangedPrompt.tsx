import { pairDeviceXROnboarding } from '@/onboarding/pairDeviceXR';
import { useCreateRoom } from '@/services/publicApi/propertyHooks';
import { usePropertySocket } from '@/services/publicApi/PropertySocketProvider';
import { useIsLoggedIn } from '@/services/publicApi/userHooks';
import { useClearPlanes } from '@/stores/roomStore';
import { AlefError } from '@alef/common';
import { Container, Root, Text } from '@react-three/uikit';
import { useEditorMode } from '../../../stores/roomStore/hooks/editing';
import { BodyAnchor } from '../anchors';
import { Button } from '../ui/Button';
import { Defaults } from '../ui/Defaults';
import { Heading } from '../ui/Heading';
import { Surface } from '../ui/Surface';

export interface RoomChangedPromptProps {}

export function RoomChangedPrompt({}: RoomChangedPromptProps) {
	const isLoggedIn = useIsLoggedIn();

	return (
		<BodyAnchor follow position={[0.5, -0.15, 0.5]} lockY distance={0.1}>
			<Root pixelSize={0.001}>
				<Defaults>
					<Surface width={300}>
						<Heading level={1}>Room Changed</Heading>
						{/* TODO: better text here */}
						<Text>
							It looks like you may have moved to a new room.{' '}
							{isLoggedIn
								? 'You can either start a new room, or update your current one.'
								: 'Sign up for an account to create multiple rooms, or replace the room you were working on.'}
						</Text>
						<Container flexDirection="column" justifyContent="flex-start" gap={10}>
							{isLoggedIn ? <NewRoomButton /> : <SignUpButton />}
							<ResetPlanesButton />
						</Container>
					</Surface>
				</Defaults>
			</Root>
		</BodyAnchor>
	);
}

function ResetPlanesButton() {
	const clearPlanes = useClearPlanes();

	return (
		<Button onClick={clearPlanes}>
			<Text>Continue with current furniture</Text>
		</Button>
	);
}

function NewRoomButton() {
	const property = usePropertySocket();
	if (!property) {
		throw new AlefError(AlefError.Code.Unknown, 'Missing property context');
	}
	const createRoom = useCreateRoom(property.id);
	return (
		<Button onClick={createRoom}>
			<Text>Start a new room</Text>
		</Button>
	);
}

function SignUpButton() {
	const [_, setMode] = useEditorMode();
	const startLogin = () => {
		setMode('settings');
		pairDeviceXROnboarding.restart();
	};

	return (
		<Button onClick={startLogin}>
			<Text>Sign up for more rooms</Text>
		</Button>
	);
}
