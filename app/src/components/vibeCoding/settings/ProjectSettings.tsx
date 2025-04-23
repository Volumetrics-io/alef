import { SubscriptionProductSelector } from '@/components/subscription/SubscriptionProductSelector';
import { Box, Heading } from '@alef/sys';
import { useProjectId } from '../hooks';
import { EditProjectForm } from './EditProjectForm';
import { ModelSelector } from './ModelSelector';

export interface ProjectSettingsProps {
	className?: string;
}

export function ProjectSettings({ className }: ProjectSettingsProps) {
	const projectId = useProjectId();

	return (
		<Box stacked gapped className={className} p="small">
			<Heading level={2}>Project</Heading>
			<EditProjectForm projectId={projectId} />
			<ModelSelector />
			<Heading level={2}>Account</Heading>
			<SubscriptionProductSelector showFree returnTo={location.href} />
			{/* TODO: bring back devices */}
			{/* <Heading level={2}>Devices</Heading>
			<DeviceIDCard />
			<Heading level={3}>Pair devices</Heading>
			<DeviceDiscovery />
			<DevicePaircodeClaim />
			<PairedDeviceList /> */}
		</Box>
	);
}
