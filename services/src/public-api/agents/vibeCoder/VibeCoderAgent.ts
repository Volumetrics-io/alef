import { AGENT_ERRORS, AlefError, assertPrefixedId, isPrefixedId, PrefixedId } from '@alef/common';
import { unstable_callable as callable } from 'agents';
import { AIChatAgent } from 'agents/ai-chat-agent';
import { createDataStreamResponse, formatDataStreamPart, streamText, StreamTextOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';

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
	#organizationId: PrefixedId<'or'> | null = null;
	#model;
	initialState: VibeCoderState = {
		model: 'qwq-32b',
		code: '',
		description: '',
	};

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.#model = createWorkersAI({ binding: env.AI })(VibeCoderModels[this.state.model] as any);
		// setup SQL tables
		this.sql`
			CREATE TABLE IF NOT EXISTS metadata (
				key TEXT PRIMARY KEY,
				value TEXT NULL
			);
		`;
		const { organizationId } = this.#getOwnership();
		if (organizationId) {
			assertPrefixedId(organizationId, 'or');
			this.#organizationId = organizationId;
		}
	}

	async onStart() {
		console.log('VibeCoderAgent started');
	}

	#getOwnership() {
		const rows = this.sql<{ key: string; value: string }>`SELECT * FROM metadata WHERE key = ${'ownership'}`;
		if (rows.length > 0) {
			const row = rows[0];
			return {
				organizationId: row.value,
			};
		}
		return { organizationId: null };
	}

	#getQuotaId() {
		if (!this.#organizationId) {
			throw new AlefError(AlefError.Code.InternalServerError, 'No organization ID found');
		}
		return this.env.TOKEN_QUOTA.idFromName(this.#organizationId);
	}

	async #getQuota() {
		const quotaObject = this.env.TOKEN_QUOTA.get(this.#getQuotaId());
		return quotaObject.getDetails();
	}

	/**
	 * Updates the organization association with this agent, which
	 * determines the quota limits and how usage is tracked.
	 *
	 * If this is not called after the agent is created, the agent will
	 * not be able to process requests.
	 */
	updateOrganizationOwner(organizationId: PrefixedId<'or'>) {
		this.#organizationId = organizationId;
		this.sql`
			INSERT INTO metadata (key, value)
				VALUES (${'ownership'}, ${organizationId})
				ON CONFLICT(key) DO UPDATE SET value = excluded.value;`;
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
					// ensure we have not exceeded the daily token limit
					const quota = await this.#getQuota();
					if (quota.exceeded) {
						// IDK how to actually communicate this to the client
						console.error(`Quota exceeded for ${this.#organizationId}`);
						dataStream.write(formatDataStreamPart('error', AGENT_ERRORS.QUOTA_EXCEEDED));
					}
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
						onFinish: (event) => {
							onFinish?.(event as any);
							const { completionTokens, promptTokens } = event.usage;
							if (this.#organizationId) {
								this.env.TOKEN_QUOTA.get(this.#getQuotaId()).addUsage(completionTokens + promptTokens, `VibeCoderAgent ${this.name} - ${this.#organizationId}`);
							}
						},
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
				- always use the provided 'defaultController' for user input mapping. always define named actions for things the player can do.
				- if adding utilities, use the ones provided by "@react-three/drei", DO NOT use the ones provided by "three".
				- remember to always add lighting to your scene.

				\`\`\`
				import { <objects needed> } from 'three';
				import { useRef } from 'react';
				import { useFrame } from '@react-three/fiber';

				// default input mapping controller and input devices
				import { defaultController, devices } from '@alef/framework/runtime';

				// YOU CAN CHANGE THESE INPUTS AND BINDINGS AS YOU LIKE:
				// add bindable input actions by name and type
				defaultController.addBoolean('jump').addRange('move-x').addRange('move-y');
				// bind named actions to device inputs - these are the game's default bindings.
				devices.keyboard
					.bindKey('jump', ' ')
					.bindAxis('move-x', 'ArrowLeft', 'ArrowRight')
					.bindAxis('move-y', 'ArrowDown', 'ArrowUp');
				devices.gamepad
					.bindButton('jump', 0)
					.bindAxis('move-x', 0)
					.bindAxis('move-y', 1);
				devices.onscreen
					.bindButton('jump', { label: 'A', key: 'a', position: { x: 0.9, y: 0.9 } })
					.bindStick('move-x', 'move-y', { xAxisKey: 'left-stick-x', yAxisKey: 'left-stick-y', position: { x: 0.1, y: 0.9 } });

				export const App = () => { // DO NOT RENAME THIS FUNCTION
					const mainRef = useRef(null);

					// init variables here and here only
					// lean towards good r3f practices
					// like using refs when necessary

					useFrame(() => {
						defaultController.update();
						// control action values are available through controller API
						const jumping = defaultController.getValue('jump');
						const { x: xMovement, y: yMovement } = defaultController.getVector2('move-x', 'move-y');

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
