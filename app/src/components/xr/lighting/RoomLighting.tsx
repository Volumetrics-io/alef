import { useLightPlacementIds } from '@/stores/roomStore';
import { useRef } from 'react';
import { Group } from 'three';
import { CeilingLight } from './CeilingLight';
import { ShadowLight, ShadowLightTarget } from './ShadowLight';

export const RoomLighting = () => {
	const lightIds = useLightPlacementIds();

	const targetRef = useRef<Group>(null);

	return (
		<>
			<ShadowLightTarget targetRef={targetRef} />
			<ShadowLight target={targetRef.current} />
			{lightIds.map((id) => {
				return <CeilingLight key={id} id={id} />;
			})}
		</>
	);
};
