import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { Agent, routeAgentRequest, unstable_callable as callable } from 'agents';
import { generateObject, NoObjectGeneratedError } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings, Env } from '../../config/ctx';
import { z } from 'zod';

export interface VibeCoderState {
	model: VibeCoderModel;
	code: string;
	description: string;
	messages: any[];
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

export class VibeCoderAgent extends Agent<Bindings, VibeCoderState> {
	#model;
	initialState: VibeCoderState = {
		model: 'qwq-32b',
		code: '',
		description: '',
		messages: [],
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
			messages: this.state.messages,
		});

		this.#model = createWorkersAI({ binding: this.env.AI })(VibeCoderModels[modelURI] as any);
	}

	@callable()
	async generateCode(prompt: string) {
		this.state.messages.push({ role: 'user', content: prompt });
		let result;
		try {
			result = await generateObject({
				model: this.#model,
				system: this.#getSystemComponentPrompt(),
				messages: this.state.messages,
				output: 'object',
				maxTokens: 10000,
				schema: z.object({
					code: z.string(),
					description: z.string(),
				}),
			});
		} catch (error) {
			if (NoObjectGeneratedError.isInstance(error)) {
				console.log('NoObjectGeneratedError');
				console.log('Cause:', error.cause);
				console.log('Text:', error.text);
				console.log('Response:', error.response);
				console.log('Usage:', error.usage);
				console.log('Finish Reason:', error.finishReason);
			}
			return;
		}

		if (!result) {
			console.error('No result from generateObject');
			return;
		}

		console.log('result', result.object);

		this.setState({
			model: this.state.model ?? 'qwq-32b',
			code: result.object?.code ?? '',
			description: result.object?.description ?? '',
			messages: [...this.state.messages, { role: 'assistant', content: result.object?.description ?? '' }],
		});

		return;
	}

	@callable()
	clearMessages() {
		this.setState({
			model: this.state.model ?? 'qwq-32b',
			code: '',
			description: '',
			messages: [],
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

export default {
	async fetch(request: Request, env: Env) {
		return (await routeAgentRequest(request, env, { prefix: 'some/prefix' })) || new Response('Not found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
