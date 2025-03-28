import { NavBar } from '@/components/navBar/NavBar';
import { PropertySelect } from '@/components/properties/PropertySelect';
import { Box, Heading, Main } from '@alef/sys';
import { useNavigate } from '@verdant-web/react-router';

const PropertiesPage = () => {
	const navigate = useNavigate();
	return (
		<Main>
			<NavBar />
			<Box stacked gapped padded="squeeze">
				<Heading level={1}>Properties</Heading>
				<PropertySelect
					onValueChange={(p) => {
						navigate(`/properties/${p}`);
					}}
				/>
			</Box>
		</Main>
	);
};

export default PropertiesPage;
