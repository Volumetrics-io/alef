import { PrefixedId } from '@alef/common';
import { Box, Icon, Tabs, Text } from '@alef/sys';
import { useParams, useSearchParams } from '@verdant-web/react-router';
import clsx from 'clsx';
import { Suspense } from 'react';
import { AgentProvider } from './AgentContext';
import { ChatHistory } from './chat/ChatHistory';
import { ChatInput } from './chat/ChatInput';
import { SimpleChat } from './chat/SimpleChat';
import { MainPanelResizer } from './common/MainPanelResizer';
import { MainPanelToggle } from './common/MainPanelToggle';
import { CreateProject } from './projects/CreateProject';
import { ProjectSelector } from './projects/ProjectSelector';
import { CodeRenderer } from './renderer/CodeRenderer';
import { ProjectSettings } from './settings/ProjectSettings';
import cls from './VibeCodingUI.module.css';

export interface VibeCodingUIProps {}

export function VibeCodingUI({}: VibeCodingUIProps) {
	const { projectId } = useParams<{ projectId?: PrefixedId<'p'> }>();

	const [query, setQuery] = useSearchParams();
	const tab = query.get('tab') || 'chat';
	const setTab = (tab: string) => {
		setQuery((prev) => {
			prev.set('tab', tab);
			return prev;
		});
	};

	if (!projectId) {
		// make the user select a project
		return (
			<Box className={cls.root} asChild>
				<Tabs value="projects">
					<Box className={cls.sidebar}>
						<Box stretched stacked p="small">
							<VibeCodingTabs />
							<Box stretched stacked gapped>
								<Suspense>
									<ProjectSelector />
								</Suspense>
							</Box>
							<Box className={cls.controls}>
								<CreateProject className={cls.controlsButton} />
							</Box>
						</Box>
					</Box>
					<Box layout="center center" full stacked gapped className={clsx(cls.content, cls.emptyState)}>
						<Icon name="box" className={cls.emptyStateIcon} />
						<Text>Select a project to get started</Text>
					</Box>
					<MainPanelResizer />
				</Tabs>
			</Box>
		);
	}

	return (
		<Suspense>
			<Box full className={cls.root} asChild>
				<Tabs value={tab} onValueChange={setTab}>
					<AgentProvider key={projectId}>
						<Box className={cls.sidebar}>
							<Box stretched stacked>
								<VibeCodingTabs />
								<Tabs.Content value="projects">
									<Box stretched stacked gapped>
										<Suspense>
											<ProjectSelector />
										</Suspense>
									</Box>
									<Box className={cls.controls}>
										<CreateProject className={cls.controlsButton} />
									</Box>
								</Tabs.Content>
								<Tabs.Content value="chat">
									<Suspense>
										<ChatHistory />
									</Suspense>
									<Box className={cls.controls}>
										<Suspense>
											<ChatInput />
										</Suspense>
									</Box>
								</Tabs.Content>
								<Tabs.Content value="settings">
									<Suspense>
										<ProjectSettings />
									</Suspense>
								</Tabs.Content>
							</Box>
						</Box>
						<Box className={cls.content}>
							<Suspense>
								<CodeRenderer />
							</Suspense>
							<Suspense>
								<SimpleChat float="bottom-center" />
							</Suspense>
							<MainPanelToggle float="top-left" />
						</Box>
					</AgentProvider>
					<MainPanelResizer />
				</Tabs>
			</Box>
		</Suspense>
	);
}

function VibeCodingTabs() {
	const { projectId } = useParams<{ projectId?: PrefixedId<'p'> }>();

	return (
		<Box p="small" layout="center center">
			<Tabs.List className={cls.tabs}>
				<Tabs.Trigger className={cls.tab} value="projects">
					<Icon name="box" />
					<Text className={cls.tabLabel}>Projects</Text>
				</Tabs.Trigger>
				<Tabs.Trigger className={cls.tab} value="chat" disabled={!projectId}>
					<Icon name="bot-message-square" />
					<Text className={cls.tabLabel}>Chat</Text>
				</Tabs.Trigger>
				<Tabs.Trigger className={cls.tab} value="settings" disabled={!projectId}>
					<Icon name="settings" />
					<Text className={cls.tabLabel}>Settings</Text>
				</Tabs.Trigger>
			</Tabs.List>
		</Box>
	);
}
