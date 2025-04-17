import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { Agent, routeAgentRequest, unstable_callable as callable } from 'agents';
import { createDataStreamResponse, generateObject, streamObject, StreamObjectOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings, Env } from '../../config/ctx';
import { z } from 'zod';

export interface VibeCoderState {
	code: string;
	description: string;
	messages: any[];
}

export class VibeCoderAgent extends Agent<Bindings, VibeCoderState> {
	#model;
	initialState: VibeCoderState = {
		code: '',
		description: '',
		messages: [],
	};

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.#model = createWorkersAI({ binding: env.AI })('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
		this.state.messages = [];
	}

	async onStart() {
		console.log('VibeCoderAgent started');
	}

	@callable()
	async generateCode(prompt: string) {
		console.log('generateCode', prompt);
		this.state.messages.push({ role: 'user', content: prompt });
		const result = await generateObject({
			model: this.#model,
			system: this.#getSystemComponentPrompt(),
			messages: this.state.messages,
			output: 'object',
			schema: z.object({
				code: z.string(),
				description: z.string(),
			}),
		});

		this.setState({
			code: result.object?.code ?? '',
			description: result.object?.description ?? '',
			messages: [...this.state.messages, { role: 'assistant', content: result.object?.description ?? '' }],
		});

		return;
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

				export const App = () => {
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

			- DO NOT add a camera or scene
			- DO NOT import packages.
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
