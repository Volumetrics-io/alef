import { AttributeKey, attributeKeys } from '@alef/common';
import { Box, Button, Input, Select } from '@alef/sys';
import { useState } from 'react';

export interface AttributePickerProps {
	onSubmit: (attribute: string) => void;
}

export function AttributePicker({ onSubmit }: AttributePickerProps) {
	const [selectedKey, setSelectedKey] = useState<AttributeKey>(attributeKeys[0]);
	const [selectedValue, setSelectedValue] = useState('');

	return (
		<Box>
			<AttributeKeySelect value={selectedKey} onValueChange={setSelectedKey} />
			<Input value={selectedValue} onValueChange={setSelectedValue} />
			<Button onClick={() => onSubmit(`${selectedKey}:${selectedValue}`)}>Ok</Button>
		</Box>
	);
}

function AttributeKeySelect({ value, onValueChange }: { value: AttributeKey; onValueChange: (value: AttributeKey) => void }) {
	return (
		<Select value={value} onValueChange={onValueChange}>
			{attributeKeys.map((key) => (
				<Select.Item key={key} value={key}>
					{key}
				</Select.Item>
			))}
		</Select>
	);
}
