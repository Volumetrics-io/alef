// uses a shared GLTF loader extended with credentials support on fetch.

import { ObjectMap, useLoader } from '@react-three/fiber';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
gltfLoader.setWithCredentials(true);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoder/1.5.5/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

export function useAuthenticatedGLTF(src: string): GLTF & ObjectMap {
	return useLoader(gltfLoader, src) as any;
}
useAuthenticatedGLTF.preload = (path: string) => {
	useLoader.preload(gltfLoader, path);
};
useAuthenticatedGLTF.clear = (path: string) => {
	useLoader.clear(gltfLoader, path);
};
