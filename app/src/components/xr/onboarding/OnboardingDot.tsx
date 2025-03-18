import { Onboarding, OnboardingStep } from '@a-type/onboarding';
import { useFrame } from '@react-three/fiber';
import { Content } from '@react-three/uikit';
import { useRef } from 'react';
import { Mesh } from 'three';
import { colors } from '../ui/theme';

export interface OnboardingDotProps<TOnboarding extends Onboarding<any>> {
	onboarding: TOnboarding;
	step: OnboardingStep<TOnboarding>;
	position?: [number, number, number];
	uniqueKey?: string;
}

export function OnboardingDot<TOnboarding extends Onboarding<any>>({ onboarding, step, position, uniqueKey }: OnboardingDotProps<TOnboarding>) {
	const { show } = onboarding.useStep(step, { uniqueKey, disableNextOnUnmount: true });
	const pulseRef = useRef<Mesh>(null);

	useFrame((state) => {
		if (!show) return;
		const pulse = pulseRef.current;
		if (!pulse) return;

		pulse.scale.x = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
		pulse.scale.y = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
		pulse.scale.z = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
	});

	if (!show) return null;

	return (
		<Content positionType="absolute" positionLeft={-25} positionTop={-25} width={50} height={50}>
			<group position={position}>
				<mesh ref={pulseRef}>
					<sphereGeometry args={[0.08, 32, 32]} />
					<meshBasicMaterial color={colors.focus.peek()} transparent opacity={0.5} />
				</mesh>
				<mesh>
					<sphereGeometry args={[0.005, 32, 32]} />
					<meshBasicMaterial color={colors.focus.peek()} />
				</mesh>
			</group>
		</Content>
	);
}
