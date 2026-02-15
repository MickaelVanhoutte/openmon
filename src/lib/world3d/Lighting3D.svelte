<script lang="ts">
	import { T } from '@threlte/core';
	import type { DirectionalLight } from 'three';
	import { LIGHTING_PRESETS, type LightingMood } from '$js/lighting/biome-lighting';

	interface Props {
		mood?: LightingMood;
		playerPosition?: { x: number; y: number; z: number };
	}

	let { mood = 'day', playerPosition = { x: 0, y: 0, z: 0 } }: Props = $props();

	let config = $derived(LIGHTING_PRESETS[mood] ?? LIGHTING_PRESETS.day);
</script>

<T.DirectionalLight
	position={config.directionalPosition}
	intensity={config.directionalIntensity}
	color={config.directionalColor}
	castShadow
	oncreate={(ref: DirectionalLight) => {
		ref.shadow.mapSize.width = 512;
		ref.shadow.mapSize.height = 512;
		ref.shadow.camera.left = -15;
		ref.shadow.camera.right = 15;
		ref.shadow.camera.top = 15;
		ref.shadow.camera.bottom = -15;
		ref.shadow.camera.near = 0.5;
		ref.shadow.camera.far = 50;
		ref.shadow.bias = -0.0001;
	}}
/>

<T.AmbientLight color={config.ambientColor} intensity={config.ambientIntensity} />

<T.HemisphereLight
	args={[config.hemisphereSkyColor, config.hemisphereGroundColor, config.hemisphereIntensity]}
/>

<T.PointLight
	position={[playerPosition.x, playerPosition.y + 1.5, playerPosition.z]}
	color={config.playerLightColor}
	intensity={config.playerLightIntensity}
	distance={config.playerLightDistance}
	decay={2}
/>
