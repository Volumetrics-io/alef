import { groupPlanesByRoom, quaternionFromNormal, UnknownRoomPlaneData } from '@alef/common';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ColorRepresentation, Vector3 } from 'three';

const DEBUG_PLANES: UnknownRoomPlaneData[] = [
	// in XR, floors point down, ceilings point up, walls point out
	// room 1
	{
		label: 'floor',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: 1, x: 0, z: 0 }),
		origin: { x: 0, y: 0, z: 0 },
	},
	{
		label: 'ceiling',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: -1, x: 0, z: 0 }),
		origin: { x: 0, y: -2.5, z: 0 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 1, z: 0 }),
		origin: { x: 4, y: -1.25, z: 0 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: -1, z: 0 }),
		origin: { x: -4, y: -1.25, z: 0 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: 1 }),
		origin: { x: 0, y: -1.25, z: 5 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: -1 }),
		origin: { x: 0, y: -1.25, z: -5 },
	},
	// room 2: directly below it
	{
		label: 'floor',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: 1, x: 0, z: 0 }),
		origin: { x: 0, y: -2.5, z: 0 },
	},
	{
		label: 'ceiling',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: -1, x: 0, z: 0 }),
		origin: { x: 0, y: -5, z: 0 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 1, z: 0 }),
		origin: { x: 4, y: -3.75, z: 0 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: -1, z: 0 }),
		origin: { x: -4, y: -3.75, z: 0 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: 1 }),
		origin: { x: 0, y: -3.75, z: 5 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: -1 }),
		origin: { x: 0, y: -3.75, z: -5 },
	},
	// room 3: adjacent to room 1 on the x axis, much smaller.
	{
		label: 'floor',
		extents: [4, 6],
		orientation: quaternionFromNormal({ y: 1, x: 0, z: 0 }),
		origin: { x: 6, y: 0, z: 0 },
	},
	{
		label: 'ceiling',
		extents: [4, 6],
		orientation: quaternionFromNormal({ y: -1, x: 0, z: 0 }),
		origin: { x: 6, y: -1.25, z: 0 },
	},
	{
		label: 'wall',
		extents: [6, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 1, z: 0 }),
		origin: { x: 8, y: -0.625, z: 0 },
	},
	{
		label: 'wall',
		extents: [6, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: -1, z: 0 }),
		origin: { x: 4, y: -0.625, z: 0 },
	},
	{
		label: 'wall',
		extents: [4, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: 1 }),
		origin: { x: 6, y: -0.625, z: 3 },
	},
	{
		label: 'wall',
		extents: [4, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: -1 }),
		origin: { x: 6, y: -0.625, z: -3 },
	},
	// room 4: floor is partway up the wall of room 1, adjacent on z axis
	{
		label: 'floor',
		extents: [4, 6],
		orientation: quaternionFromNormal({ y: 1, x: 0, z: 0 }),
		origin: { x: 0, y: -1, z: 8 },
	},
	{
		label: 'ceiling',
		extents: [4, 6],
		orientation: quaternionFromNormal({ y: -1, x: 0, z: 0 }),
		origin: { x: 0, y: -2.25, z: 8 },
	},
	{
		label: 'wall',
		extents: [6, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 1, z: 0 }),
		origin: { x: 2, y: -1 - (2.5 - 1.25) / 2, z: 8 },
	},
	{
		label: 'wall',
		extents: [6, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: -1, z: 0 }),
		origin: { x: -2, y: -1 - (2.5 - 1.25) / 2, z: 8 },
	},
	{
		label: 'wall',
		extents: [4, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: 1 }),
		origin: { x: 0, y: -1 - (2.5 - 1.25) / 2, z: 11 },
	},
	{
		label: 'wall',
		extents: [4, 1.25],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: -1 }),
		origin: { x: 0, y: -1 - (2.5 - 1.25) / 2, z: 5 },
	},
	// room 5: on the other side of room 1, adjacent on z axis, exactly as tall and wide on that side
	{
		label: 'floor',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: 1, x: 0, z: 0 }),
		origin: { x: 0, y: 0, z: -10 },
	},
	{
		label: 'ceiling',
		extents: [8, 10],
		orientation: quaternionFromNormal({ y: -1, x: 0, z: 0 }),
		origin: { x: 0, y: -2.5, z: -10 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 1, z: 0 }),
		origin: { x: 4, y: -1.25, z: -10 },
	},
	{
		label: 'wall',
		extents: [10, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: -1, z: 0 }),
		origin: { x: -4, y: -1.25, z: -10 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: 1 }),
		origin: { x: 0, y: -1.25, z: -5 },
	},
	{
		label: 'wall',
		extents: [8, 2.5],
		orientation: quaternionFromNormal({ y: 0, x: 0, z: -1 }),
		origin: { x: 0, y: -1.25, z: -15 },
	},
];

const GRANTS_ROOMS: UnknownRoomPlaneData[] = [
	{
		origin: {
			x: 0,
			y: 0,
			z: 0,
		},
		orientation: {
			x: -2.8434333556510326e-24,
			y: 0,
			z: 4.1359030627651384e-25,
			w: 1,
		},
		extents: [3.4960999488830566, 2.9850525856018066],
		label: 'floor',
	},
	{
		origin: {
			x: -1.727042274794797,
			y: -1.774438525762116,
			z: -0.6501802978926281,
		},
		orientation: {
			x: -0.4973574538059266,
			y: 0.5026286610339756,
			z: -0.5026284499190741,
			w: -0.49735743300851337,
		},
		extents: [0.8500001430511475, 0.6499999165534973],
		label: 'window',
	},
	{
		origin: {
			x: -1.5067236067211018,
			y: -1.1475055709238413,
			z: -0.7982282722733636,
		},
		orientation: {
			x: 5.817323933047386e-8,
			y: -0.7110350160484676,
			z: 3.0825432113370316e-8,
			w: 0.7031566364517539,
		},
		extents: [0.9020934104919434, 0.42268216609954834],
		label: 'table',
	},
	{
		origin: {
			x: -7.019809043662624,
			y: -1.7599216947625471,
			z: 1.9851273394570534,
		},
		orientation: {
			x: -0.49123497177453174,
			y: 0.5086139176956924,
			z: -0.5086136737945729,
			w: -0.4912350877709222,
		},
		extents: [3.455677032470703, 3.4762794971466064],
		label: 'wall',
	},
	{
		origin: {
			x: -4.49556745704347,
			y: -0.019536581044062334,
			z: 2.0702428958635486,
		},
		orientation: {
			x: 8.624229622424285e-8,
			y: -0.016798943543908536,
			z: -3.873494481490721e-8,
			w: 0.9998590440580208,
		},
		extents: [5.058126449584961, 3.4556756019592285],
		label: 'floor',
	},
	{
		origin: {
			x: 0.014857981331021702,
			y: -1.2251406911176685,
			z: -1.4920005311200955,
		},
		orientation: {
			x: 0.000018313229177996725,
			y: 0.7071068068555469,
			z: -0.7071067421029754,
			w: 0.00001826745351680875,
		},
		extents: [3.4656898975372314, 2.449349880218506],
		label: 'wall',
	},
	{
		origin: {
			x: 1.7326022914610668,
			y: -1.541162054925126,
			z: 1.1605979599570992,
		},
		orientation: {
			x: 0.5014054279001054,
			y: 0.4985903598864014,
			z: -0.49859040409317884,
			w: 0.5014058226922301,
		},
		extents: [0.352830171585083, 0.4326658546924591],
		label: 'wall art',
	},
	{
		origin: {
			x: -1.9679760650068066,
			y: -1.7553098534678948,
			z: 2.1542056827080853,
		},
		orientation: {
			x: 0.5086128156162047,
			y: 0.49123593251598446,
			z: -0.4912359483148067,
			w: 0.5086131479567765,
		},
		extents: [3.4555721282958984, 3.4762792587280273],
		label: 'wall',
	},
	{
		origin: {
			x: 1.7393212818353216,
			y: -1.012424586457069,
			z: 0.027816341080561302,
		},
		orientation: {
			x: 0.5014047478680678,
			y: 0.498591066032838,
			z: -0.4985910743228878,
			w: 0.5014049883499017,
		},
		extents: [1.825718879699707, 2.022775173187256],
		label: 'door',
	},
	{
		origin: {
			x: -0.0356661499020378,
			y: -0.8141726180063995,
			z: -1.1859604906508174,
		},
		orientation: {
			x: -1.1431136613049763e-7,
			y: -0.7074154021164601,
			z: 1.0698491578561048e-7,
			w: 0.7067981017468573,
		},
		extents: [0.6023879051208496, 0.3619369864463806],
		label: 'table',
	},
	{
		origin: {
			x: -1.3131785871599757,
			y: -0.8902990196175947,
			z: -0.6573773343990504,
		},
		orientation: {
			x: -1.523120115491063e-7,
			y: -0.7110369587460622,
			z: 2.0584317526112167e-8,
			w: 0.7031546048419256,
		},
		extents: [1.2431691884994507, 0.8062744140625],
		label: 'table',
	},
	{
		origin: {
			x: -4.492887065969486,
			y: -3.495751233987973,
			z: 2.0697842343809234,
		},
		orientation: {
			x: 0.9998593268447374,
			y: 2.10430368178878e-8,
			z: 0.01677475765505546,
			w: 7.27939049989335e-8,
		},
		extents: [5.058197975158691, 3.455674648284912],
		label: 'ceiling',
	},
	{
		origin: {
			x: 1.3046736776851047,
			y: -1.7587065731684401,
			z: 1.491081729278716,
		},
		orientation: {
			x: 0.7071040726563373,
			y: -0.001942657131067284,
			z: 0.0019427631325680025,
			w: 0.7071043721321892,
		},
		extents: [0.5950738191604614, 0.3775095045566559],
		label: 'wall art',
	},
	{
		origin: {
			x: -4.434145299676658,
			y: -1.7570614351880591,
			z: 0.3431702592293072,
		},
		orientation: {
			x: -0.011874233795340113,
			y: -0.7070069277137813,
			z: 0.707007045960777,
			w: -0.011874239188294132,
		},
		extents: [5.054118633270264, 3.4762797355651855],
		label: 'wall',
	},
	{
		origin: {
			x: 1.7457112977399296,
			y: -1.5673641470748796,
			z: -1.205980400287603,
		},
		orientation: {
			x: 0.5013937701448226,
			y: 0.4986021499702371,
			z: -0.49860207297008285,
			w: 0.5013940473227072,
		},
		extents: [0.483853816986084, 0.6149795651435852],
		label: 'wall art',
	},
	{
		origin: {
			x: -0.3521948668209538,
			y: -1.0370395742965677,
			z: 1.4817913354786794,
		},
		orientation: {
			x: 0.7071039962253513,
			y: -0.0019428035333333433,
			z: 0.0019428198781114654,
			w: 0.707104190848015,
		},
		extents: [0.8930261135101318, 2.07584285736084],
		label: 'door',
	},
	{
		origin: {
			x: -1.7334523420403014,
			y: -1.2241184173257498,
			z: -0.008828034649037808,
		},
		orientation: {
			x: 0.4974320316667973,
			y: -0.5025544152056416,
			z: 0.5025546969750645,
			w: 0.49743211195648696,
		},
		extents: [2.9666733741760254, 2.4493496417999268],
		label: 'wall',
	},
	{
		origin: {
			x: 1.7392986185397457,
			y: -1.2254388987168146,
			z: 0.0004496022852918946,
		},
		orientation: {
			x: 0.5013639112931332,
			y: 0.498632148184843,
			z: -0.4986322127254991,
			w: 0.5013641933177434,
		},
		extents: [2.985051155090332, 2.4493508338928223],
		label: 'wall',
	},
	{
		origin: {
			x: -4.554115678302094,
			y: -1.7579985709375139,
			z: 3.7966636756460876,
		},
		orientation: {
			x: 0.7070071847002587,
			y: -0.011866478403301399,
			z: 0.011866560321793528,
			w: 0.7070072673307253,
		},
		extents: [5.054110527038574, 3.4762790203094482],
		label: 'wall',
	},
	{
		origin: {
			x: -0.0009041630694237579,
			y: -2.449626934253359,
			z: -0.008325933749978143,
		},
		orientation: {
			x: 0.9999964016679251,
			y: -2.146209073124698e-8,
			z: 0.002681786306993213,
			w: 9.179422755150561e-8,
		},
		extents: [3.480327606201172, 2.9850518703460693],
		label: 'ceiling',
	},
	{
		origin: {
			x: 0.005212939110102621,
			y: -1.2752878549527014,
			z: -1.4919509080229871,
		},
		orientation: {
			x: 0.012114501707923608,
			y: 0.7070030450578644,
			z: -0.7070029420075158,
			w: 0.012114408110264945,
		},
		extents: [1.0692198276519775, 0.44436734914779663],
		label: 'wall art',
	},
	{
		origin: {
			x: 1.4758451100594936,
			y: -1.5684881587151889,
			z: -1.4915553513637456,
		},
		orientation: {
			x: -0.00007620998543387139,
			y: -0.7071067081260284,
			z: 0.7071068106276444,
			w: -0.00007633086831280486,
		},
		extents: [0.4855537414550781, 0.607863187789917],
		label: 'wall art',
	},
	{
		origin: {
			x: -5.24068465370131,
			y: -1.5707664456692023,
			z: 0.31036822379252194,
		},
		orientation: {
			x: 0.012315546260981707,
			y: 0.706999653562141,
			z: -0.706999443396493,
			w: 0.012315467263845636,
		},
		extents: [0.7500002384185791, 0.9000000357627869],
		label: 'window',
	},
	{
		origin: {
			x: -0.008707508896595967,
			y: -1.224353086391337,
			z: 1.4836821118520773,
		},
		orientation: {
			x: 0.7071040579886334,
			y: -0.0018831481810978477,
			z: 0.0018832107268782182,
			w: 0.7071042198809333,
		},
		extents: [3.4798359870910645, 2.449349880218506],
		label: 'wall',
	},
	{
		origin: {
			x: -2.396725096313868,
			y: -1.5308515258452626,
			z: 3.8677579552205406,
		},
		orientation: {
			x: 0.7069914196022375,
			y: -0.01214817432273683,
			z: 0.012171765323682958,
			w: 0.7070129257488944,
		},
		extents: [0.9438381195068359, 0.7394835352897644],
		label: 'wall art',
	},
	{
		origin: {
			x: -3.327022268849781,
			y: -1.0495599874883565,
			z: 3.8361876596386817,
		},
		orientation: {
			x: 0.7070028255033926,
			y: -0.012117049902320272,
			z: 0.01211709588911741,
			w: 0.7070028846055564,
		},
		extents: [0.6329026222229004, 2.0582542419433594],
		label: 'door',
	},
];

const groupColors = ['blue', 'green', 'purple', 'orange', 'yellow', 'pink', 'brown', 'cyan', 'lime'];

export function DebugRoomsPage() {
	const { floorGroups: grouped, unassignedPlanes } = groupPlanesByRoom(GRANTS_ROOMS);

	return (
		<Canvas style={{ width: '100vw', height: '100vh' }}>
			<ambientLight />
			<pointLight position={[10, 10, 10]} />
			<group rotation={[Math.PI, 0, 0]}>
				{grouped.map((group, groupIndex) => group.allPlanes.map((plane, i) => <Plane key={i} color={groupColors[groupIndex]} plane={plane} />))}
				{unassignedPlanes?.map((plane, i) => <Plane key={i} color="red" plane={plane} />)}
			</group>
			<OrbitControls />
			<axesHelper />
		</Canvas>
	);
}

function Plane({ plane, color }: { plane: UnknownRoomPlaneData; color: ColorRepresentation }) {
	return (
		<group position={[plane.origin.x, plane.origin.y, plane.origin.z]} quaternion={[plane.orientation.x, plane.orientation.y, plane.orientation.z, plane.orientation.w]}>
			{/* represent the plane as facing inward, even though in XR they face outward, just because it makes more sense */}
			<mesh rotation={[Math.PI, 0, 0]}>
				<planeGeometry args={[plane.extents[0], plane.extents[1]]} />
				<meshStandardMaterial color={color} transparent opacity={plane.label === 'floor' ? 1 : 0.5} />
			</mesh>
			{/* but remind the viewer of the actual normal with an arrow */}
			<arrowHelper args={[new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, color]} />
		</group>
	);
}

export default DebugRoomsPage;
