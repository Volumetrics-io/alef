import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { AIChatAgent } from 'agents/ai-chat-agent';
import { createDataStreamResponse, streamText, StreamTextOnFinishCallback, tool } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { z } from 'zod';
import { Bindings } from '../../config/ctx';

export interface VibeCoderState {
	code: string;
}

export class VibeCoderAgent extends AIChatAgent<Bindings, VibeCoderState> {
	#model;
	initialState: VibeCoderState = {
		code: '',
	};

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.#model = createWorkersAI({ binding: env.AI })('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
	}

	async onStart() {
		console.log('VibeCoderAgent started');
	}

	async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>): Promise<Response | undefined> {
		if (!isPrefixedId(this.name, 'p')) {
			throw new AlefError(AlefError.Code.InternalServerError, 'LayoutAgent must be created with a property ID');
		}
		return agentContext.run({ env: this.env, propertyId: this.name }, async () => {
			const dataStreamResponse = createDataStreamResponse({
				execute: async (dataStream) => {
					let processedMessages = this.messages;
					processedMessages.unshift({
						role: 'user',
						content: `Here's the current code of the simulation: ${this.state.code}`,
						id: 'user-code',
					});
					const result = streamText({
						model: this.#model,
						system: this.#getSystemPrompt(),
						// system: 'You are a duck. Don\'t do anything besides say "quack," ever.',
						messages: processedMessages,
						tools: {
							replaceCode: tool({
								description: 'Replace the source code of the simulation',
								parameters: z
									.object({ code: z.string().describe('The source code of the simulation') })
									.describe('A map of parameters used to replace the source code of the simulation'),
								execute: async ({ code }) => {
									this.setState({ code });
									return 'Code replaced successfully';
								},
							}),
						},
						onFinish,
						onError: ({ error }) => {
							console.error(`Error in AI model: ${error}`);
						},
						maxSteps: 5,
					});

					result.mergeIntoDataStream(dataStream);
				},
			});

			return dataStreamResponse;
		});
	}

	#getSystemPrompt() {
		return `You are a helpful software developer who is implementing a ThreeJS-based interactive simulation for a client.

		Your task is to assist the user in creating a simulation that meets their requirements and specifications. You are provided with a tool you can invoke to replace the code of the simulation.

		You may converse with the user to understand their desires and requirements. You may also ask clarifying questions to ensure you understand their needs. When you know what the user wants, you can use the tool to replace the code of the simulation.

		Do not respond with code examples or snippets unless the user asks for them. If you want to make a change to the code, do so with the provided tools.

		Your code should always include the entire HTML, CSS, and JavaScript code needed to run the simulation, including importing ThreeJS from a CDN.
		`;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
