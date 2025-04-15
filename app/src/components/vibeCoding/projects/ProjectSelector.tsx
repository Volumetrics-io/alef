import { useAllProperties } from '@/services/publicApi/propertyHooks';
import { assertPrefixedId, PrefixedId } from '@alef/common';
import { Select } from '@alef/sys';
import { useNavigate, useParams } from '@verdant-web/react-router';

export interface ProjectSelectorProps {}

export function ProjectSelector({}: ProjectSelectorProps) {
	const { propertyId } = useParams<{ propertyId: PrefixedId<'p'> }>();
	const navigate = useNavigate();
	const { data: properties } = useAllProperties();

	return (
		<Select
			value={propertyId || ''}
			onValueChange={(id) => {
				assertPrefixedId(id, 'p');
				navigate(`/projects/${id}`);
			}}
			placeholder="Select a project"
		>
			{properties.map((property) => (
				<Select.Item key={property.id} value={property.id}>
					{property.name}
				</Select.Item>
			))}
		</Select>
	);
}
