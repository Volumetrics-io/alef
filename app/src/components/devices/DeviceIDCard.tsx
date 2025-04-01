import { useCurrentDevice, useUpdateDevice } from '@/services/publicApi/deviceHooks';
import { Box, Form, Frame } from '@alef/sys';

export function DeviceIDCard() {
	const { data: selfDevice } = useCurrentDevice();
	const updateDevice = useUpdateDevice();

	return (
		<Box stacked gapped align="center" full="width">
			<Frame padded stacked gapped full="width">
				<Form
					initialValues={{ name: selfDevice?.name || '' }}
					enableReinitialize
					onSubmit={async ({ name }) => {
						if (!selfDevice) return;
						await updateDevice.mutateAsync({ deviceId: selfDevice.id, updates: { name } });
					}}
				>
					<Form.TextField name="name" label="This device" />
					<Form.Submit disabled={!selfDevice}>Change name</Form.Submit>
				</Form>
			</Frame>
		</Box>
	);
}
