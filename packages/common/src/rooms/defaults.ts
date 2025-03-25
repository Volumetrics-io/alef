import { id, PrefixedId } from '../ids.js';
import { RoomLightPlacement, RoomState, UnknownRoomPlaneData } from './state.js';
import { ROOM_STATE_VERSION } from './version.js';

export const DEMO_ROOM_PLANES: UnknownRoomPlaneData[] = [
	{
		origin: {
			x: 1.5540139879175476,
			y: -1.0623698483676551,
			z: -0.28917475053375014,
		},
		orientation: {
			x: 0.5095221030747302,
			y: 0.4902933659253982,
			z: -0.49029323228234145,
			w: 0.5095219332025355,
		},
		extents: [1.5176448822021484, 2.0522117614746094],
		label: 'door',
	},
	{
		origin: {
			x: 1.1102230246251565e-16,
			y: -3.469446951953614e-18,
			z: -4.163336342344337e-17,
		},
		orientation: {
			x: 0,
			y: 1.3877787807814457e-17,
			z: 8.271806125530277e-25,
			w: 1,
		},
		extents: [4.414746284484863, 4.5105085372924805],
		label: 'floor',
	},
	{
		origin: {
			x: -1.713986425161453,
			y: -1.2478494881243427,
			z: -1.8797456612091779,
		},
		orientation: {
			x: -0.270638100749971,
			y: 0.6532649849112658,
			z: -0.6532650402357293,
			w: -0.2706381782556073,
		},
		extents: [1.0618244409561157, 2.4985568523406982],
		label: 'wall',
	},
	{
		origin: {
			x: -2.1486008590856436,
			y: -1.2469583044226975,
			z: 0.31503854075074866,
		},
		orientation: {
			x: -0.4917945627751,
			y: 0.508072909092116,
			z: -0.508073096909401,
			w: -0.4917947046554546,
		},
		extents: [3.643000841140747, 2.4985570907592773],
		label: 'wall',
	},
	{
		origin: {
			x: 0.05381667611035501,
			y: -2.498557806810075,
			z: -0.02834405709175812,
		},
		orientation: {
			x: -0.01409766059117529,
			y: -7.893988679446334e-8,
			z: 0.9999007661981302,
			w: 3.06955112046229e-8,
		},
		extents: [4.399805068969727, 4.451904773712158],
		label: 'ceiling',
	},
	{
		origin: {
			x: 0.7564651125726515,
			y: -1.2417334511738283,
			z: -1.9026035725420665,
		},
		orientation: {
			x: -0.29926811838382705,
			y: -0.640655006699049,
			z: 0.640654954861548,
			w: -0.2992680781585826,
		},
		extents: [0.8857486248016357, 2.498556613922119],
		label: 'wall',
	},
	{
		origin: {
			x: -0.4212220765177881,
			y: -1.3870845548761623,
			z: -2.248153454506431,
		},
		orientation: {
			x: 0.0027173588536870677,
			y: 0.7071016788695687,
			z: -0.707101771601034,
			w: 0.0027173373608794364,
		},
		extents: [1.467583179473877, 1.504187822341919],
		label: 'window',
	},
	{
		origin: {
			x: 1.683219945482207,
			y: -1.043206721856187,
			z: 2.2416216197828858,
		},
		orientation: {
			x: 0.7070428711905993,
			y: -0.009525006872236313,
			z: 0.009524899170910029,
			w: 0.70704270986923,
		},
		extents: [0.8166663646697998, 2.0503361225128174],
		label: 'door',
	},
	{
		origin: {
			x: -1.6131352888563826,
			y: -1.3875133411192124,
			z: -1.9806759946109616,
		},
		orientation: {
			x: -0.27063821775127395,
			y: 0.6532648395354181,
			z: -0.6532649440980098,
			w: -0.27063830397597777,
		},
		extents: [0.557888388633728, 1.5247313976287842],
		label: 'window',
	},
	{
		origin: {
			x: 1.5534878230881062,
			y: -1.247061201830308,
			z: -0.27756933844371406,
		},
		orientation: {
			x: 0.5095220871819922,
			y: 0.49029339253474913,
			z: -0.4902933032699127,
			w: 0.5095218944328104,
		},
		extents: [2.539072036743164, 2.498556613922119],
		label: 'wall',
	},
	{
		origin: {
			x: -0.4331256706853388,
			y: -1.2488448998240775,
			z: -2.248251172192038,
		},
		orientation: {
			x: 0.002715364358078875,
			y: 0.7071021931948649,
			z: -0.707101167450617,
			w: 0.002715390708037107,
		},
		extents: [1.8117237091064453, 2.498556613922119],
		label: 'wall',
	},
	{
		origin: {
			x: -0.0057290973256091116,
			y: -1.2465536234411339,
			z: 2.1961233698824625,
		},
		orientation: {
			x: 0.7070427847246724,
			y: -0.00952497013831032,
			z: 0.009524864766657907,
			w: 0.7070426438333204,
		},
		extents: [4.399808883666992, 2.4985568523406982],
		label: 'wall',
	},
	{
		origin: {
			x: 1.3219084024977077,
			y: -1.243367914201787,
			z: -1.5540818114805703,
		},
		orientation: {
			x: 0.009972981494988825,
			y: 0.7070365219890755,
			z: -0.7070366364985808,
			w: 0.009972965704559102,
		},
		extents: [0.5610368251800537, 2.4985568523406982],
		label: 'wall',
	},
	{
		origin: {
			x: 0.7335609394783226,
			y: -1.3812183679989891,
			z: -1.9299113784057729,
		},
		orientation: {
			x: 0.29926800539990356,
			y: 0.6406549910092547,
			z: -0.6406550326760018,
			w: 0.2992680923813411,
		},
		extents: [0.5547409057617188, 1.4832980632781982],
		label: 'window',
	},
	{
		origin: {
			x: 2.1985633456508693,
			y: -1.2528673278823286,
			z: 1.6216859275722129,
		},
		orientation: {
			x: 0.5032588529554571,
			y: 0.49672016933447805,
			z: -0.4967201034823223,
			w: 0.5032586646812236,
		},
		extents: [1.2643812894821167, 2.4985568523406982],
		label: 'wall',
	},
	{
		origin: {
			x: 1.855740272658848,
			y: -1.2507815502047352,
			z: 0.991026956114556,
		},
		orientation: {
			x: 0.0000013138931819104443,
			y: 0.7071068693851357,
			z: -0.707106919994812,
			w: 0.0000013365753960377761,
		},
		extents: [0.702137291431427, 2.498556613922119],
		label: 'wall',
	},
];

export const DEMO_ROOM_LIGHTS: Omit<RoomLightPlacement, 'id'>[] = [
	{
		position: {
			x: 0.5793650698195086,
			y: 2.4975580156286017,
			z: -1.0949505762355056,
		},
	},
	{
		position: {
			x: -1.2537746877380989,
			y: 2.4975579090092572,
			z: -1.106464894379379,
		},
	},
	{
		position: {
			x: 0.6700376732872123,
			y: 2.4975576771709154,
			z: 1.0711347241506353,
		},
	},
	{
		position: {
			x: -1.1834257915060655,
			y: 2.4975575587781913,
			z: 1.1262182396062568,
		},
	},
];

/**
 * Creates a fully empty room, no planes, no lights, no furniture.
 */
export function getEmptyRoomState(idOverride?: PrefixedId<'r'>): RoomState {
	const defaultLayoutId = id('rl');
	return {
		id: idOverride || id('r'),
		version: ROOM_STATE_VERSION,
		planes: [],
		planesUpdatedAt: null,
		layouts: {
			[defaultLayoutId]: {
				id: defaultLayoutId,
				name: 'Default layout',
				type: 'living-room',
				furniture: {},
			},
		},
		lights: {},
		globalLighting: {
			color: 6.5,
			intensity: 1.7,
		},
	};
}

/**
 * Creates a room with a demonstration layout. Good for demoing the app
 * on devices which can't scan their own room. The planes can and will
 * be automatically replaced if/when the user loads this room in a headset.
 */
export function getDemoRoomState(idOverride?: PrefixedId<'r'>): RoomState {
	return {
		...getEmptyRoomState(idOverride),
		planes: DEMO_ROOM_PLANES.map((p) => ({ id: id('rp'), ...p })),
		planesUpdatedAt: null, // don't mark an update time; if the device detects planes it should immediately overwrite ours.
		lights: Object.fromEntries(DEMO_ROOM_LIGHTS.map((l, i) => [id(`lp`), { id: id(`lp`), ...l }])),
	};
}
