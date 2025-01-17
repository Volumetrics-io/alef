import { UpdatePasswordButton } from '@/components/auth/UpdatePasswordButton';
import { useMe } from '@/services/publicApi/userHooks';
import { Frame, Heading, Hero, Main, Text } from '@alef/sys';

const CompleteSignupPage = () => {
	const {
		data: { name, email },
	} = useMe();

	return (
		<Main>
			<Hero>
				<Hero.Title>Finish Your Account</Hero.Title>
			</Hero>
			<Frame stacked gapped padded constrained>
				<Heading level={2}>{name ? `Welcome, ${name}` : 'Welcome to Alef'}</Heading>
				<Text>Thanks for joining us. Let's set up your new password and verify your email to get started.</Text>
				<UpdatePasswordButton email={email} color="suggested" />
			</Frame>
		</Main>
	);
};

export default CompleteSignupPage;
