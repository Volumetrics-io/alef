import { Attribute } from '@alef/common';
import { Box } from '@alef/sys';
import { useState } from 'react';
import { FilteredFurniture } from './FilteredFurniture';
import { MultiAttributePicker } from './MultiAttributePicker';

export function FurnitureBrowser() {
	const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);

	return (
		<Box stacked gapped full>
			<MultiAttributePicker value={selectedAttributes} onChange={setSelectedAttributes} />
			<FilteredFurniture filters={selectedAttributes} />
		</Box>
	);
}
