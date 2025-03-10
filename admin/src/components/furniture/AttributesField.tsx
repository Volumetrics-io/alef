import { RoomType } from '@alef/common';
import { Box, Form, Label } from '@alef/sys';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';
import { RoomCategoryPicker } from './RoomCategoryPicker';

export interface AttributesFieldProps {
	name: string;
}

export function AttributesField({ name }: AttributesFieldProps) {
	const [field] = Form.useField<{ key: string; value: string }[]>(name);

	const categoryValues = field.value.filter((attr) => attr.key === 'category').map((attr) => attr.value as RoomType);
	return (
		<Form.FieldArray name={name}>
			{(helpers) => (
				<Box gapped stacked>
					<Label>Attributes</Label>
					<RoomCategoryPicker
						value={categoryValues}
						onValueChange={(value) => {
							// diff previous category attributes with selected values
							for (const attr of field.value) {
								if (attr.key === 'category' && !value.includes(attr.value as RoomType)) {
									helpers.remove(field.value.indexOf(attr));
								}
							}
							// add new category attributes
							for (const category of value) {
								if (!field.value.find((attr) => attr.key === 'category' && attr.value === category)) {
									helpers.push({ key: 'category', value: category });
								}
							}
						}}
						multiple
					/>
					<AttributePicker omitKeys={['category']} onSubmit={(attr) => helpers.push(attr)} actionText="Add" />
					<Box gapped wrap>
						{field.value.map((attr, idx) => (
							<AttributePill attribute={attr} key={`${attr.key}:${attr.value}`} onRemove={() => helpers.remove(idx)} />
						))}
					</Box>
				</Box>
			)}
		</Form.FieldArray>
	);
}
