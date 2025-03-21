import { useIsEditorStageMode } from '@/stores/editorStore';
import { useAddLight } from '@/stores/roomStore';
import { Matrix4, Vector3 } from 'three';
import { usePrimaryCeilingPlane } from '../../../stores/roomStore/hooks/layout';
import { PlanePlacement } from '../anchors/PlanePlacement';
import { CeilingLightModel } from './CeilingLightModel';

export const SpawnLight = () => {
	const enabled = useIsEditorStageMode('lighting');

	const primaryCeiling = usePrimaryCeilingPlane() ?? {
		id: 'rp-default-ceiling',
		origin: { x: 0, y: 2.5, z: 0 },
		extents: [10, 10],
		// facing downward
		orientation: { x: 0, y: 1, z: 0, w: 0 },
		label: 'ceiling',
	};

	const addLight = useAddLight();

	const addLightAtPoint = (matrix: Matrix4) => {
		const point = new Vector3();
		point.setFromMatrixPosition(matrix);
		addLight({
			position: {
				x: point.x,
				y: point.y,
				z: point.z,
			},
		});
	};

	return (
		<PlanePlacement onPlace={addLightAtPoint} plane={primaryCeiling} enabled={enabled} bothSides>
			<CeilingLightModel />
		</PlanePlacement>
	);
};
