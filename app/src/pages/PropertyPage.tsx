import { NavBar } from '@/components/navBar/NavBar';
import { useProperty } from '@/services/publicApi/propertyHooks';
import { PrefixedId } from '@alef/common';
import { Box, Breadcrumbs, Button, Heading, Main } from '@alef/sys';
import { Link, useParams } from '@verdant-web/react-router';

const PropertyPage = () => {
	const { propertyId } = useParams<{ propertyId: PrefixedId<'p'> }>();

	const { data: property } = useProperty(propertyId);

	if (!property) {
		return (
			<Main>
				<NavBar />
				<Box stacked gapped padded="squeeze">
					<Heading level={1}>Property not found</Heading>
					<Button asChild color="suggested">
						<Link to="/properties">Return to Properties</Link>
					</Button>
				</Box>
			</Main>
		);
	}

	return (
		<Main>
			<NavBar />
			<Box stacked gapped padded="squeeze">
				<Breadcrumbs>
					<Breadcrumbs.Trigger asChild>
						<Link to="/properties">Properties</Link>
					</Breadcrumbs.Trigger>
					<Breadcrumbs.Label>{property.name}</Breadcrumbs.Label>
				</Breadcrumbs>
				<Heading level={1}>{property.name}</Heading>
				<div>Property management from phones and tablets is coming soon!</div>
			</Box>
		</Main>
	);
};

export default PropertyPage;
