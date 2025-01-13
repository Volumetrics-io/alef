import { Box, Form, Label } from '@alef/sys';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';

export interface AttributesFieldProps {
	name: string;
}

export function AttributesField({ name }: AttributesFieldProps) {
	const [field] = Form.useField<{ key: string; value: string }[]>(name);
	return (
		<Form.FieldArray name={name}>
			{(helpers) => (
				<Box gapped stacked>
					<Label>Attributes</Label>
					<AttributePicker onSubmit={(attr) => helpers.push(attr)} actionText="Add" />
					<Box gapped>
						{field.value.map((attr, idx) => (
							<AttributePill attribute={attr} key={`${attr.key}:${attr.value}`} onRemove={() => helpers.remove(idx)} />
						))}
					</Box>
				</Box>
			)}
		</Form.FieldArray>
	);
}
