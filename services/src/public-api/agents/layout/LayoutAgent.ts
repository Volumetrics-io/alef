import { AIChatAgent } from 'agents/ai-chat-agent';
import { createDataStreamResponse, streamText, StreamTextOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';
import { tools } from './tools';
import { processToolCalls } from './utils';

export class LayoutAgent extends AIChatAgent<Bindings> {
	async onStart() {
		console.log('LayoutAgent started');
	}

	async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>): Promise<Response | undefined> {
		const model = createWorkersAI({ binding: this.env.AI })('@cf/meta/llama-2-7b-chat-int8');
		return agentContext.run({ env: this.env }, async () => {
			const dataStreamResponse = createDataStreamResponse({
				execute: async (dataStream) => {
					// If the AI responds with tool calls, we want to process them now
					const processedMessages = await processToolCalls({
						messages: this.messages,
						dataStream,
						tools,
						// none of our tools require confirmation for execution (yet)
						// if we add confirmed tools, the actual execution of said tools
						// will live here.
						executions: {},
					});

					const result = streamText({
						model,
						system: this.#getSystemPrompt(),
						messages: processedMessages,
						tools,
						onFinish,
						onError: console.error,
						maxSteps: 10,
					});

					result.mergeIntoDataStream(dataStream);
				},
			});

			return dataStreamResponse;
		});
	}

	#getSystemPrompt() {
		return `You are a helpful assistant that can assist users with their room layout and furniture arrangement. Monitor the user's chat requests and utilize the tools available to make adjustments to the placement of furniture in a specific layout of a room.

		When a user asks you to make changes to a room's furniture layout, always utilize the provided tools to make the changes.`;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings }>();
