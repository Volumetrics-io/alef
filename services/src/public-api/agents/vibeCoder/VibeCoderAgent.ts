import { AGENT_ERRORS, AlefError, assertPrefixedId, isPrefixedId, PrefixedId } from '@alef/common';
import { Agent, unstable_callable as callable } from 'agents';
import { generateText, UIMessage } from 'ai';
import { AsyncLocalStorage } from 'async_hooks';
import { createWorkersAI } from 'workers-ai-provider';
import { Bindings } from '../../config/ctx';
import { randomUUID } from 'crypto';

// other providers
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
	apiKey: 'AIzaSyBp7LmF3sFr4IzdMIgMPLzRCW7ZdgLBkFs',
});

export interface VibeCoderState {
	model: VibeCoderModel;
	code: string;
	messages: UIMessage[];
}

const VibeCoderModels = {
	'llama-3.3-70b': '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
	'deepseek-r1-qwen-32b': '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
	'llama-4-scout-17b': '@cf/meta/llama-4-scout-17b-16e-instruct',
	'gemma-3-12b': '@cf/google/gemma-3-12b-it',
	'qwq-32b': '@cf/qwen/qwq-32b',
	'qwen2.5-coder-32b': '@cf/qwen/qwen2.5-coder-32b-instruct',
	'gemini-2.5-flash': 'third-party',
};

export const VibeCoderModelNames = ['llama-3.3-70b', 'deepseek-r1-qwen-32b', 'llama-4-scout-17b', 'gemma-3-12b', 'qwq-32b', 'qwen2.5-coder-32b', 'gemini-2.5-flash'] as const;

export type VibeCoderModel = (typeof VibeCoderModelNames)[number];

export class VibeCoderAgent extends Agent<Bindings, VibeCoderState> {
	#organizationId: PrefixedId<'or'> | null = null;
	#model;
	#thirdPartyModel: any;
	initialState: VibeCoderState = {
		model: 'qwen2.5-coder-32b',
		code: '',
		messages: [],
	};

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		if (this.state.model === 'gemini-2.5-flash') {
			this.#thirdPartyModel = google('gemini-2.5-flash-preview-04-17');
		} else {
			this.#model = createWorkersAI({ binding: env.AI })(VibeCoderModels[this.state.model] as any);
		}
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
			messages: this.state.messages,
		});

		if (modelURI === 'gemini-2.5-flash') {
			this.#thirdPartyModel = google('gemini-2.5-flash-preview-04-17');
		} else {
			this.#thirdPartyModel = null;
			this.#model = createWorkersAI({ binding: this.env.AI })(VibeCoderModels[modelURI] as any);
		}
	}

	async getExamples(manifest: string) {
		return this.env.AI.autorag('alef-examples').aiSearch({
			query: this.#createRAGQuery(manifest),
			rewrite_query: true,
			max_num_results: 5,
		});
	}

	async generateCode(manifest: string, examples: string, originalPrompt: string) {
		if (!isPrefixedId(this.name, 'p')) {
			throw new AlefError(AlefError.Code.InternalServerError, 'VibeCoderAgent must be created with a property ID');
		}

		return generateText({
			model: this.#thirdPartyModel ?? this.#model,
			system: this.#getCodeGeneratorSystemPromptNoControllers(examples, originalPrompt),
			prompt: manifest,
			maxSteps: 5,
			maxTokens: 10000,
		});
	}

	@callable()
	async prompt(message: string) {
		this.setState({
			model: this.state.model,
			code: this.state.code,
			messages: [...this.state.messages, { role: 'user', content: message, id: randomUUID(), parts: [] }],
		});

		console.log(message);

		this.setState({
			model: this.state.model,
			code: this.state.code,
			messages: [...this.state.messages, { role: 'assistant', content: 'designing...', id: randomUUID(), parts: [] }],
		});

		if (!isPrefixedId(this.name, 'p')) {
			throw new AlefError(AlefError.Code.InternalServerError, 'VibeCoderAgent must be created with a property ID');
		}

		let designResult = await generateText({
			model: this.#thirdPartyModel ?? this.#model,
			system: this.#getDesignerPrompt(),
			prompt: message,
			maxSteps: 5,
			maxTokens: 10000,
		});

		let manifest = this.parseResult(designResult.text);

		console.log(manifest);

		this.setState({
			model: this.state.model,
			code: this.state.code,
			messages: [...this.state.messages, { role: 'assistant', content: 'fetching assets...', id: randomUUID(), parts: [] }],
		});

		const examples = await this.getExamples(manifest);

		console.log(examples.response);

		this.setState({
			model: this.state.model,
			code: this.state.code,
			messages: [...this.state.messages, { role: 'assistant', content: 'coding...', id: randomUUID(), parts: [] }],
		});
		const finalResult = await this.generateCode(manifest, examples.response, message);

		let result = this.parseResult(finalResult.text);
		let sanitizedResult = this.sanitizeJSONString(result);
		console.log(`Sanitized Result: ${sanitizedResult}`);

		const parsedResult = JSON.parse(sanitizedResult);
		if (parsedResult.code) {
			this.setState({
				model: this.state.model ?? 'qwen2.5-coder-32b',
				code: parsedResult.code ?? '',
				messages: [...this.state.messages, { role: 'assistant', content: parsedResult.description ?? '', id: randomUUID(), parts: [] }],
			});
		}

		return;
	}

	parseResult(result: string) {
		let sanitizedResult = result;
		if (result.includes('</think>')) {
			sanitizedResult = result.split('</think>')[1].replace(/^[\s\r\n]+/, '');
		}
		if (sanitizedResult.includes('```json')) {
			sanitizedResult = sanitizedResult.split('```json')[1].replace(/^[\s\r\n]+/, '');
			sanitizedResult = sanitizedResult.split('```')[0].replace(/^[\s\r\n]+/, '');
			console.log(`Result: ${sanitizedResult}`);
		}
		return sanitizedResult;
	}

	#getDesignerPrompt() {
		return `You are SceneManifestGenerator, a specialist in turning natural-language game scene ideas into minimal, unambiguous JSON manifests.  
				Always output **only** valid JSON that conforms exactly to the following schema—no comments, no extra keys, no prose:

				\`\`\`json
				"lighting": [
					{
					"key": "ambient" | "dir" | "spot",
					"color": string,        // hex or CSS color
					"intensity": number
					}
				],
				"objects": [
					{
					"id": string,
					"count": number, // number of this object type to create
					"model": "box" | "sphere" | "plane" | "cylinder" | "torus" | "dreiComponent",
					"dreiComponentName"?: string,  // name of the @react-three/drei component when model is "dreiComponent"
					"position": [number, number, number],
					"scale": number,
					"material": { "color": string },  // only solid colors (hex or CSS color), no textures
					"behaviors"?: ["spin" | "bounce" | "follow" | "orbit" | "lookAt" | "float"],
					"userControls"?: boolean,
					"dreiProps"?: object,   // optional properties to pass to the drei component, only for model = "dreiComponent"
					"shader"?: {
						"type": "MeshReflectorMaterial" | "MeshWobbleMaterial" | "MeshDistortMaterial" | "MeshRefractionMaterial" | "ShaderMaterial" | string,  // name of the drei shader material
						"props": object      // shader-specific properties
					}
					}
				],
				}
				\`\`\`

				Constraints:

				Use only built-in primitives: box, sphere, plane, cylinder, torus.
				You can also use @react-three/drei components by setting model to "dreiComponent" and specifying the component name in dreiComponentName.
				
				Support for drei shaders is available through the shader field, which can specify shader type and properties.

				No external assets—do not reference .glb, image textures, or URLs.

				Materials must be solid colors when not using shaders; omit any texture property.

				Output must be pure JSON (wrapped in a single code block if required).

				Omit optional fields when not needed.

				User: "Replace this with the user's scene description."

				Your Response:

				\`\`\`json
				<SceneManifest JSON>
				\`\`\`
		`;
	}

	#createRAGQuery(manifest: string) {
		return `provide a selection of code snippets that match the objects and lighting in the following manifest, strictly following this criteria:

				- use only built-in primitives: box, sphere, plane, cylinder, torus.
				- primitives should be constructed using r3f <mesh>, <group>, <shapeNameGeometry>, and <materialNameMaterial> components.
				- use @react-three/drei components by setting model to "dreiComponent" and specifying the component name in dreiComponentName.
				- support for drei shaders is available through the shader field, which can specify shader type and properties.
				- no external assets—do not reference .glb, image textures, or URLs.
				- materials must be solid colors when not using shaders; omit any texture property.
				- omit optional fields when not needed.
				- DO NOT import or use <Canvas>, <OrbitControls>, or <Stats> components.
				- r3f primitives use the following format: <primitiveName>
				- DO NOT import r3f primitives (mesh, group, shapeNameGeometry, materialNameMaterial, directionalLight, etc), these are globally available.
				- object.behaviors are not existing components, they must be created using the "useFrame" hook.
				- keep the examples concise and to the point.
				manifest:
				${manifest}
		`;
	}

	#getCodeGeneratorSystemPromptNoControllers(examples: string, originalPrompt: string) {
		return `You are a Senior Game Developer with expertise in THREE.js and React-Three-Fiber, and @react-three/drei. You are given a scene manifest and the following examples, you are to generate a react-three/fiber component that matches the objects and lighting in the examples.

			examples:
			${examples}
			
			use the following template to create a r3f component:

				- DO NOT rename the component
				- DO NOT use TypeScript
				- DO NOT import any libraries directly besides "react", "react-dom", "@react-three/fiber", and "@react-three/drei". For all other libraries you want to use, utilize the "https://esm.sh" CDN.
				- prioritize React-Three-Fiber and Drei over ThreeJS.
				- DO NOT import r3f primitives (mesh, group, shapeNameGeometry, materialNameMaterial, directionalLight, etc), these are globally available.
				- you DO need to import drei components (such as shaders) when needed.
				- r3f primitives use the following format: <primitiveName>
				- if adding utilities, use the ones provided by "@react-three/drei", DO NOT use the ones provided by "three".
				- remember to always add lighting to your scene.
				- behaviors are not components, they must be created using the "useFrame" hook.
				- useFrame is a 'react-three/fiber' hook, NOT a 'react' hook.
				- ALWAYS EXPORT THE FUNCTION AS "App"

				\`\`\`
				import { <objects needed> } from 'three';
				import { useRef } from 'react';
				import { useFrame } from '@react-three/fiber'; // KEEP THIS IMPORT

				export const App = () => { // DO NOT RENAME THIS FUNCTION, ALWAYS EXPORT THE FUNCTION AS "App"
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
			- the text MUST be formatted as a valid json object. it should be parseable using JSON.parse().

			the final output should be valid JSON object using this format:

			\`\`\`json
				{
					"code": "the code for the component",
					"description": "a description of the final experience and any relevant details. \\n \\n <suggestions>"
				}
			\`\`\`

			- the description should be in the context of the original request and using similar terms.
			- the description should be in plain language, 
			- keep the description brief, under 100 words.
			- DO NOT use technical jargon, like "component", or "app".
			- refer to the final result as the thing that was requested. 
				- ex: the user requests a "solar system", then refer to the final result as a "solar system".
				- ex: the user requests a "game", then refer to the final result as a "game".
				- ex: the user requests a "3d scene", then refer to the final result as a "3d scene".
			- keep it friendly but not over the top.
			- as a separate paragraph, suggest ideas or ask if there is anything the user would like to add to enhance the experience.

			example:



			original request:
			${originalPrompt}
		`;
	}

	#getCodeGeneratorSystemPrompt(examples: string, originalPrompt: string) {
		return `You are a Senior Game Developer with expertise in THREE.js and React-Three-Fiber, and @react-three/drei. You are given a scene manifest and the following examples, you are to generate a react-three/fiber component that matches the objects and lighting in the examples.

			examples:
			${examples}
			
			use the following template to create a r3f component:

				- DO NOT rename the component
				- DO NOT use TypeScript
				- DO NOT import any libraries directly besides "react", "react-dom", "@react-three/fiber", and "@react-three/drei". For all other libraries you want to use, utilize the "https://esm.sh" CDN.
				- prioritize React-Three-Fiber and Drei over ThreeJS.
				- DO NOT import r3f primitives (mesh, group, shapeNameGeometry, materialNameMaterial, directionalLight, etc), these are globally available.
				- you DO need to import drei components (such as shaders) when needed.
				- r3f primitives use the following format: <primitiveName>
				- always use the provided 'defaultController' for user input mapping. always define named actions for things the player can do.
				- if adding utilities, use the ones provided by "@react-three/drei", DO NOT use the ones provided by "three".
				- remember to always add lighting to your scene.
				- behaviors are not components, they must be created using the "useFrame" hook.
				- useFrame is a react-three/fiber hook.

				\`\`\`
				import { <objects needed> } from 'three';
				import { useRef } from 'react';
				import { useFrame } from '@react-three/fiber'; // KEEP THIS IMPORT

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

				export const App = () => { // DO NOT RENAME THIS FUNCTION, ALWAYS EXPORT THE FUNCTION AS "App"
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
			- the text MUST be formatted as a valid json object. it should be parseable using JSON.parse().

			the final output should be valid JSON object using this format:

			\`\`\`json
				{
					"code": "the code for the component",
					"description": "a description of the final experience and any relevant details. \\n \\n <suggestions>"
				}
			\`\`\`

			- the description should be in the context of the original request and using similar terms.
			- the description should be in plain language, 
			- DO NOT use technical jargon, like "component", or "app".
			- refer to the final result as the thing that was requested. 
				- ex: the user requests a "solar system", then refer to the final result as a "solar system".
				- ex: the user requests a "game", then refer to the final result as a "game".
				- ex: the user requests a "3d scene", then refer to the final result as a "3d scene".
			- keep it friendly but not over the top.
			- suggest ideas or ask if there is anything the user would like to add to enhance the experience.
				- have these suggestions as a separate paragraph.

			original request:
			${originalPrompt}
		`;
	}

	sanitizeJSONString(input: string) {
		let output = '';
		let inString = false;

		for (let i = 0; i < input.length; i++) {
			const ch = input[i];

			// toggle inString on un-escaped double-quotes
			if (ch === '"' && input[i - 1] !== '\\') {
				inString = !inString;
				output += ch;
			} else if (inString) {
				if (ch === '\\') {
					// preserve existing backslash+nextChar
					output += '\\' + input[++i];
				} else if (ch === '\n') {
					output += '\\n';
				} else if (ch === '\r') {
					output += '\\r';
				} else {
					output += ch;
				}
			} else {
				output += ch;
			}
		}

		return output;
	}
}

export const agentContext = new AsyncLocalStorage<{ env: Bindings; propertyId: PrefixedId<'p'> }>();
