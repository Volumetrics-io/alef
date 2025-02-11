import { useAllProperties } from '@/services/publicApi/propertyHooks';
import { PrefixedId } from '@alef/common';
import { Select } from '@alef/sys';

export interface PropertySelectProps {
	className?: string;
	onValueChange?: (value: PrefixedId<'p'>) => void;
}

export function PropertySelect({ className, onValueChange }: PropertySelectProps) {
	const { data: properties } = useAllProperties();

	return (
		<Select onValueChange={onValueChange} className={className}>
			{properties?.map((property) => (
				<Select.Item value={property.id} key={property.id}>
					{property.name}
				</Select.Item>
			))}
		</Select>
	);
}
