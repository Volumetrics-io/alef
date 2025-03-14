import { Form } from '@alef/sys';
import { DesktopRoomTypePicker } from '../common/DesktopRoomTypePicker';

export function DesktopLayoutTypeField({ name = 'type' }: { name?: string }) {
	const [field, , meta] = Form.useField({
		name,
	});

	return <DesktopRoomTypePicker value={[field.value]} onValueChange={(v) => meta.setValue(v[0])} />;
}
