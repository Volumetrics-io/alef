import { VibeCoderModel } from '@alef/services/public-api';
import { Select } from '@alef/sys';
import { useCallback } from 'react';
import { useAgentContext, VibeCoderModelNames } from '../AgentContext';

export interface ModelSelectorProps {}

export function ModelSelector({}: ModelSelectorProps) {
	const { state, agent } = useAgentContext();

	const setModel = useCallback(
		(model: VibeCoderModel) => {
			console.log('setting model', model);
			agent.call('setModel', [model]);
		},
		[agent]
	);
	return (
		<Select value={state.model} onValueChange={(value) => setModel(value as VibeCoderModel)}>
			{VibeCoderModelNames.map((key) => (
				<Select.Item key={key} value={key}>
					{key}
				</Select.Item>
			))}
		</Select>
	);
}
