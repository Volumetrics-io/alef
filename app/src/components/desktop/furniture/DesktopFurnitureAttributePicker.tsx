import { useAllFilters, useSetFilters } from '@/stores/FilterStore';
import { Attribute, AttributeKey, formatAttribute, parseAttribute } from '@alef/common';
import { Box, Button, Frame, Icon, Select } from '@alef/sys';

export interface DesktopFurnitureAttributePickerProps {
	options: Attribute[];
	attributeKey: AttributeKey;
}

export function DesktopFurnitureAttributePicker({ options, attributeKey }: DesktopFurnitureAttributePickerProps) {
	const allFilters = useAllFilters();
	const setFilters = useSetFilters();

	const filters = allFilters.filter((f) => f.key === attributeKey);

	return (
		<Box stacked>
			<Select
				value=""
				placeholder="Select..."
				onValueChange={(v) => {
					if (!v) return;
					if (v === 'all') {
						setFilters((prev) => prev.filter((a) => a.key !== attributeKey));
					} else {
						const attr = parseAttribute(v);
						setFilters((prev) => [...prev, attr]);
					}
				}}
			>
				<Select.Item value="all">All</Select.Item>
				{options.map((attr) => (
					<Select.Item key={formatAttribute(attr)} value={formatAttribute(attr)}>
						{attr.value}
					</Select.Item>
				))}
			</Select>
			{!!filters.length && (
				<Box wrap gapped p="small">
					{filters.map((attr) => (
						<Frame gapped p="squeeze" align="center" style={{ textWrap: 'nowrap' }} key={formatAttribute(attr)}>
							<Box>{attr.value}</Box>
							<Button onClick={() => setFilters((prev) => prev.filter((a) => formatAttribute(a) !== formatAttribute(attr)))} color="ghost">
								<Icon name="x" />
							</Button>
						</Frame>
					))}
				</Box>
			)}
		</Box>
	);
}
