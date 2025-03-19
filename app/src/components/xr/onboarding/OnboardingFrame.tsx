import { Button } from '@/components/xr/ui/Button.js';
import { Surface } from '@/components/xr/ui/Surface.js';
import { Onboarding, OnboardingStep } from '@a-type/onboarding';
import { Container, ContainerProperties, Text } from '@react-three/uikit';
import { ReactNode } from 'react';
import { colors } from '../ui/theme';

export interface OnboardingFrameProps<TOnboarding extends Onboarding<any>> extends ContainerProperties {
	onboarding: TOnboarding;
	step: OnboardingStep<TOnboarding>;
	children?: ReactNode;
	uniqueKey?: string;
}

export function OnboardingFrame<TOnboarding extends Onboarding<any>>({ onboarding, step, children, uniqueKey, ...rest }: OnboardingFrameProps<TOnboarding>) {
	const { show, next, isLast } = onboarding.useStep(step, { uniqueKey });

	if (!show) {
		return null;
	}

	return (
		<Surface flexDirection="column" gap={10} padding={15} backgroundColor={colors.secondaryPaper} width={300} {...rest}>
			{children}
			<Container flexDirection="row" gap={5} justifyContent="flex-end" alignItems="center">
				<Button onClick={next}>
					<Text>{isLast ? 'Finish' : 'Next'}</Text>
				</Button>
			</Container>
		</Surface>
	);
}
