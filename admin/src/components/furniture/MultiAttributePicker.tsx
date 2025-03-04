import { Attribute } from '@alef/common';
import { Box } from '@alef/sys';
import { useState } from 'react';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';

export interface MultiAttributePickerProps {
	value?: Attribute[];
	onChange?: (value: Attribute[]) => void;
}

export function MultiAttributePicker({ value: userValue, onChange: userOnChange }: MultiAttributePickerProps) {
	const [internalValue, setInternalValue] = useState<Attribute[]>([]);
	const value = userValue ?? internalValue;
	const onChange = userOnChange
		? (updater: (v: Attribute[]) => Attribute[]) => {
				const newValue = updater(value);
				userOnChange(newValue);
			}
		: setInternalValue;

	return (
		<Box stacked gapped>
			<AttributePicker onSubmit={(attr) => onChange((v) => [...v, attr])} actionText="Add" />
			<Box gapped wrap>
				{value.map((attr, idx) => (
					<AttributePill attribute={attr} key={`${attr.key}:${attr.value}`} onRemove={() => onChange((v) => v.filter((_, i) => i !== idx))} />
				))}
			</Box>
		</Box>
	);
}
