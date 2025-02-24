import { Attribute, AttributeKey, attributeKeys } from '@alef/common';
import { Box, Button, Input, Select } from '@alef/sys';
import { useState } from 'react';

export interface AttributePickerProps {
	onSubmit: (attribute: Attribute) => void;
	actionText?: string;
	omitKeys?: AttributeKey[];
}

export function AttributePicker({ onSubmit, omitKeys, actionText = 'Ok' }: AttributePickerProps) {
	const [selectedKey, setSelectedKey] = useState<AttributeKey>(attributeKeys[0]);
	const [selectedValue, setSelectedValue] = useState('');

	return (
		<Box gapped>
			<Select value={selectedKey} onValueChange={(v) => setSelectedKey(v as AttributeKey)}>
				{attributeKeys
					.filter((key) => !omitKeys || !omitKeys.includes(key))
					.map((key) => (
						<Select.Item key={key} value={key}>
							{key}
						</Select.Item>
					))}
			</Select>
			<Input value={selectedValue} onValueChange={setSelectedValue} />
			<Button onClick={() => onSubmit({ key: selectedKey, value: selectedValue })}>{actionText}</Button>
		</Box>
	);
}
