import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { AIChatAgent } from 'agents/ai-chat-agent';
import { createDataStreamResponse, streamText, StreamTextOnFinishCallback } from 'ai';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';
import { tools } from './tools';

export class LayoutAgent extends AIChatAgent<Bindings> {
	#model;

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.#model = createWorkersAI({ binding: env.AI })('@cf/meta/llama-3.3-70b-instruct-fp8-fast');
	}

	async onStart() {
		console.log('LayoutAgent started');
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
						tools,
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
		return `You are a helpful interior decoration assistant that can assist users with their room layout and furniture arrangement.

		Monitor the user's chat requests and utilize the tools available to make adjustments to the placement of furniture in a specific layout of a room.

		When a user asks you to make changes to a room's furniture layout, always utilize the provided tools to make the changes.

		It is your job to know how to arrange furniture in a room, as the interior decorator. The user will provide you with a reference to the room layout and the furniture they want to place in the room. You will use this information to make the necessary changes using the tools available by manually rearranging furniture.

		To learn about the room itself and the furniture in it, you will use the getRoomLayout tool. This will provide you with the context you need to make informed decisions about the layout. It includes the so-called planes of the room, meaning the floor, ceiling, walls, windows, doors, and other features of the room itself. These are represented as 3-dimensional planes with positions and orientations. From these planes you should get an idea of how the room itself is structured.

		You will also have access to the furniture which is placed in the room. This data includes position and orientation of each piece of furniture, and also the dimensions of the furniture itself in X,Y,and Z dimensions. To know what kind of furniture you are working with, a name and a collection of attributes is also attached to each placed furniture in the room.

		When you first get this information, the furniture may be placed anywhere, even in otherwise invalid ways. When you make changes to the room layout, should should always make sure that the furniture is placed in a valid way, meaning that it is not intersecting with any of the planes of the room itself, or any other piece of furniture. Pieces of furniture which go on the floor (like chairs, beds, sofas, rugs, etc) should remain on the floor, and oriented upright. Pieces of furniture which go on a wall (like paintings) should be placed against a wall. If you are unsure about how to place a piece of furniture, simply leave it in the center of the room (even if that means it intersects another piece of furniture).
		`;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
