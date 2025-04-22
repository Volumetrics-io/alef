import { useAllProperties } from '@/services/publicApi/propertyHooks';
import { PrefixedId } from '@alef/common';
import { Box, Button, Icon } from '@alef/sys';
import { useNavigate, useParams } from '@verdant-web/react-router';

export interface ProjectSelectorProps {
	className?: string;
}

export function ProjectSelector({ className }: ProjectSelectorProps) {
	const { projectId } = useParams<{ projectId?: PrefixedId<'p'> }>();
	const navigate = useNavigate();
	const { data: properties } = useAllProperties();

	return (
		<Box gapped stacked p="small" className={className}>
			{properties.map((property) => (
				<Button disabled={projectId === property.id} key={property.id} grow justify="start" onClick={() => navigate(`/projects/${property.id}`)}>
					<Icon
						name="check"
						style={{
							visibility: projectId === property.id ? 'visible' : 'hidden',
						}}
					/>
					<span>{property.name}</span>
				</Button>
			))}
		</Box>
	);
}
