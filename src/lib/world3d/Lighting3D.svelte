<script lang="ts">
	import { T } from '@threlte/core';
	import type { DirectionalLight } from 'three';

	interface Props {
		timeOfDay?: string;
		playerPosition?: { x: number; y: number; z: number };
	}

	let { timeOfDay = 'day', playerPosition = { x: 0, y: 0, z: 0 } }: Props = $props();

	interface LightingConfig {
		directionalIntensity: number;
		directionalColor: number;
		ambientIntensity: number;
		hemiSkyColor: number;
		hemiGroundColor: number;
		hemiIntensity: number;
		playerLightIntensity: number;
	}

	const LIGHTING_PRESETS: Record<string, LightingConfig> = {
		dawn: {
			directionalIntensity: 0.8,
			directionalColor: 0xffa07a, // warm orange
			ambientIntensity: 0.25,
			hemiSkyColor: 0xffd4a0, // warm sky
			hemiGroundColor: 0x362907,
			hemiIntensity: 0.3,
			playerLightIntensity: 1.5
		},
		day: {
			directionalIntensity: 1.2,
			directionalColor: 0xffffff, // pure white
			ambientIntensity: 0.3,
			hemiSkyColor: 0x87ceeb, // blue sky
			hemiGroundColor: 0x362907,
			hemiIntensity: 0.3,
			playerLightIntensity: 0.3
		},
		dusk: {
			directionalIntensity: 0.7,
			directionalColor: 0xff6347, // tomato/sunset
			ambientIntensity: 0.2,
			hemiSkyColor: 0xff8c69, // salmon sky
			hemiGroundColor: 0x1a0a00,
			hemiIntensity: 0.25,
			playerLightIntensity: 5.0
		},
		night: {
			directionalIntensity: 0.5,
			directionalColor: 0x4169e1, // royal blue moonlight
			ambientIntensity: 0.1,
			hemiSkyColor: 0x191970, // midnight blue
			hemiGroundColor: 0x0a0a1a,
			hemiIntensity: 0.15,
			playerLightIntensity: 45.0
		}
	};

	let config = $derived(LIGHTING_PRESETS[timeOfDay] ?? LIGHTING_PRESETS.day);
</script>

<T.DirectionalLight
	position={[8, 12, 8]}
	intensity={config.directionalIntensity}
	color={config.directionalColor}
	castShadow
	oncreate={(ref: DirectionalLight) => {
		ref.shadow.mapSize.width = 2048;
		ref.shadow.mapSize.height = 2048;
		ref.shadow.camera.left = -15;
		ref.shadow.camera.right = 15;
		ref.shadow.camera.top = 15;
		ref.shadow.camera.bottom = -15;
		ref.shadow.camera.near = 0.5;
		ref.shadow.camera.far = 50;
		ref.shadow.bias = -0.0001;
	}}
/>

<T.AmbientLight intensity={config.ambientIntensity} />

<T.HemisphereLight args={[config.hemiSkyColor, config.hemiGroundColor, config.hemiIntensity]} />

<T.PointLight
	position={[playerPosition.x, playerPosition.y + 1.5, playerPosition.z]}
	color={0xffaa44}
	intensity={config.playerLightIntensity}
	distance={8}
	decay={2}
/>
