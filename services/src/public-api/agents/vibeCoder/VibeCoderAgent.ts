import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { unstable_callable as callable } from 'agents';
import { createDataStreamResponse, streamText, StreamTextOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';
import { AIChatAgent } from 'agents/ai-chat-agent';

export interface VibeCoderState {
	model: VibeCoderModel;
	code: string;
	description: string;
}

const VibeCoderModels = {
	'llama-3.3-70b': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
	'deepseek-r1-qwen-32b': '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
	'llama-4-scout-17b': '@cf/meta/llama-4-scout-17b-16e-instruct',
	'gemma-3-12b': '@cf/google/gemma-3-12b-it',
	'qwq-32b': '@cf/qwen/qwq-32b',
	'qwen2.5-coder-32b': '@cf/qwen/qwen2.5-coder-32b-instruct',
};

export const VibeCoderModelNames = ['llama-3.3-70b', 'deepseek-r1-qwen-32b', 'llama-4-scout-17b', 'gemma-3-12b', 'qwq-32b', 'qwen2.5-coder-32b'] as const;

export type VibeCoderModel = (typeof VibeCoderModelNames)[number];

export class VibeCoderAgent extends AIChatAgent<Bindings, VibeCoderState> {
	#model;
	initialState: VibeCoderState = {
		model: 'qwq-32b',
		code: '',
		description: '',
	};

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.#model = createWorkersAI({ binding: env.AI })(VibeCoderModels[this.state.model] as any);
	}

	async onStart() {
		console.log('VibeCoderAgent started');
	}

	@callable()
	async setModel(modelURI: VibeCoderModel) {
		if (this.state.model === modelURI) return;
		this.setState({
			model: modelURI,
			code: this.state.code,
			description: this.state.description,
		});

		this.#model = createWorkersAI({ binding: this.env.AI })(VibeCoderModels[modelURI] as any);
	}

	async onChatMessage(onFinish: StreamTextOnFinishCallback<{}>): Promise<Response | undefined> {
		if (!isPrefixedId(this.name, 'p')) {
			throw new AlefError(AlefError.Code.InternalServerError, 'LayoutAgent must be created with a property ID');
		}
		return agentContext.run({ env: this.env, propertyId: this.name }, async () => {
			const dataStreamResponse = createDataStreamResponse({
				execute: async (dataStream) => {
					let processedMessages = this.messages;
					const result = streamText({
						model: this.#model,
						system: this.#getSystemComponentPrompt(),
						messages: processedMessages,
						onStepFinish: (stepResult) => {
							console.log(`Step result: ${stepResult.text}`);
							let result = stepResult.text;
							if (result.includes('</think>')) {
								result = result.split('</think>')[1].replace(/^[\s\r\n]+/, '');
								console.log(`Result: ${result}`);
							}
							if (result.includes('```json')) {
								result = result.split('```json')[1].replace(/^[\s\r\n]+/, '');
								result = result.split('```')[0].replace(/^[\s\r\n]+/, '');
								console.log(`Result: ${result}`);
							}
							if (result.startsWith('{')) {
								try {
									console.log(`Result: ${result}`);
									const parsedResult = JSON.parse(result);
									if (parsedResult.code) {
										this.setState({
											model: this.state.model ?? 'qwq-32b',
											code: parsedResult.code ?? '',
											description: parsedResult.description ?? '',
										});
									}
								} finally {
									// do nothing
								}
							}
						},
						onFinish,
						onError: ({ error }) => {
							console.error(`Error in AI model: ${error}`);
						},
						maxTokens: 10000,
						maxSteps: 5,
					});

					result.mergeIntoDataStream(dataStream);
				},
				onError: (error) => {
					console.error(`Error in AI model: ${error}`);
					return 'Error in AI model';
				},
			});

			return dataStreamResponse;
		});
	}

	#getSystemComponentPrompt() {
		return `You are a web developer with expertise in THREE.js and React-Three-Fiber. use the following template to create a r3f component:

				- DO NOT rename the component
				- DO NOT use TypeScript
				- DO NOT import any libraries directly besides "react", "react-dom", "@react-three/fiber", and "@react-three/drei". For all other libraries you want to use, utilize the "https://esm.sh" CDN.
				- prioritize React-Three-Fiber and Drei over ThreeJS.
				- if adding controls, use the ones provided by "@react-three/drei", DO NOT use the ones provided by "three".
				- remember to always add lighting to your scene.

				\`\`\`
				import { <objects needed> } from 'three';
				import { useRef } from 'react';
				import { useFrame } from '@react-three/fiber';

				export const App = () => { // DO NOT RENAME THIS FUNCTION
					const mainRef = useRef();

					// init variables here and here only
					// lean towards good r3f practices
					// like using refs when necessary

					useFrame(() => {
						// utilize for per frame logic such as animations
						// DO NOT initialize variable in useFrame.
					});

					return (
						<group ref={mainRef}>
							{/* add any necessary markup here but
								ONLY r3f compatible elements, DO
								NOT USE DOM Elements */}
						</group>
					);
				};
				\`\`\`

			- STRICTLY ADHERE TO THE TEMPLATE.
			- DO NOT RENAME THE COMPONENT.
			- DO NOT add a camera or scene
			- DO NOT import packages.
			- DO NOT use textures or external files. Limit yourself to the primitives provided by react-three-fiber, THREE.js, and drei.
			- DO NOT FORMAT AS A CODEBLOCK, I WILL HUNT YOU DOWN IF YOU DO.
			- the text MUST be formatted as a valid json object. it should be parseable using JSON.parse().
			- use \\n in place of line breaks.
		`;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
