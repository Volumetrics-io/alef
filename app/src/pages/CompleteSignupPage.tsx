import { LogoutButton } from '@/components/auth/LogoutButton';
import { UpdatePasswordButton } from '@/components/auth/UpdatePasswordButton';
import { useMe } from '@/services/publicApi/userHooks';
import { Frame, Heading, Hero, Main, Text } from '@alef/sys';

const CompleteSignupPage = () => {
	const { data } = useMe();

	if (!data) {
		return (
			<Main>
				<Hero>
					<Hero.Title>Finish Your Account</Hero.Title>
				</Hero>
				<Frame stacked gapped padded constrained>
					<Heading level={2}>Something went wrong...</Heading>
					<Text>We're sorry, but we couldn't find your account. Please try logging in again or contact support if you need help.</Text>
					<LogoutButton />
				</Frame>
			</Main>
		);
	}

	const { name, email } = data;

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
