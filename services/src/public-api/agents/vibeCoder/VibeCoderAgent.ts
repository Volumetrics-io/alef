import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { AIChatAgent } from 'agents/ai-chat-agent';
import { createDataStreamResponse, streamText, StreamTextOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';

export interface VibeCoderState {
	code: string;
	description: string;
}

export class VibeCoderAgent extends AIChatAgent<Bindings, VibeCoderState> {
	#model;
	initialState: VibeCoderState = {
		code: '',
		description: '',
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
					const result = streamText({
						model: this.#model,
						system: this.#getSystemPrompt(),
						messages: processedMessages,
						onFinish: (result) => {
							console.log(result.text);
							const parsedResult = JSON.parse(result.text);
							this.setState({
								code: parsedResult.code ?? '',
								description: parsedResult.description ?? '',
							});
							onFinish(parsedResult as any);
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

	#getSystemPrompt() {
		return `You are a web developer with expertise in THREE.js

			Your code should always include the entire HTML, CSS, and JavaScript code needed to run the simulation, including importing ThreeJS from a CDN.

			- your response should be formatted as a valid json object using the following schema:

			{
				"code": "<the code generated>"
				"description": "<a short description of the changes you made to the code>"
			}

			- DO NOT add a camera or scene
			- DO NOT import packages.
			- DO NOT FORMAT AS A CODEBLOCK, I WILL HUNT YOU DOWN IF YOU DO.
			- the text MUST be formatted as a valid json object. it should be parseable using JSON.parse().
			- use \\n in place of line breaks.
		`;
	}

	#getSystemComponentPrompt() {
		return `You are a web developer with expertise in THREE.js and React-Three-Fiber. use the following template to create a r3f component:

				- DO NOT rename the component
				const export UserScene = () => {

				const mainRef = useRef<Group>()

				// init variables here and here only
				// lean towards good r3f practices
				// like using refs when necessary

				// utilize for per frame logic such as animations
				// DO NOT initialize variable in useFrame.
				useFrame(() => {

				})

				return (
					<group ref={mainRef}>
						{/* add any necessary markup here but 
							ONLY r3f compatible elements, DO 
							NOT USE DOM Elements */}
					</group>
				)}

			- your response should be formatted as a valid json object using the following schema:

			{
				"code": "<the code generated using the provided template>"
				"description": "<a short description of the changes you made to the code>"
			}

			- DO NOT add a camera or scene
			- DO NOT import packages.
			- DO NOT FORMAT AS A CODEBLOCK, I WILL HUNT YOU DOWN IF YOU DO.
			- the text MUST be formatted as a valid json object. it should be parseable using JSON.parse().
			- use \\n in place of line breaks.
		`;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
