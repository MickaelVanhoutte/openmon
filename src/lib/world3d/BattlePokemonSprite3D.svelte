<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Billboard } from '@threlte/extras';
	import {
		DoubleSide,
		NearestFilter,
		SRGBColorSpace,
		TextureLoader,
		MeshStandardMaterial,
		Color,
		type Texture,
		type Mesh,
		type Camera,
		Vector3
	} from 'three';

	interface SheetMetadata {
		frameCount: number;
		frameWidth: number;
		frameHeight: number;
		durations: number[];
	}

	interface Props {
		slotId: string; // unique per slot, e.g. "player-0", "opponent-1"
		spriteName: string;
		spriteDir: string; // "ani" | "ani-back" | "ani-shiny" | "ani-back-shiny"
		position: [number, number, number];
		scale?: number;
		visible?: boolean;
		brightness?: number;
		opacity?: number;
		hueRotate?: number;
		tintColor?: string;
		tintAmount?: number;
	}

	let {
		slotId,
		spriteName,
		spriteDir,
		position,
		scale = 1,
		visible = true,
		brightness = 1,
		opacity = 1,
		hueRotate = 0,
		tintColor = '#ffffff',
		tintAmount = 0
	}: Props = $props();

	// Exposed ref for external access (screen projection, etc.)
	export function getScreenPosition(camera: Camera): { x: number; y: number } {
		if (!meshRef) return { x: 0, y: 0 };
		const worldPos = new Vector3();
		meshRef.getWorldPosition(worldPos);
		const projected = worldPos.clone().project(camera);
		return {
			x: (projected.x * 0.5 + 0.5) * window.innerWidth,
			y: (-projected.y * 0.5 + 0.5) * window.innerHeight
		};
	}

	export function getScreenBounds(
		camera: Camera
	): { x: number; y: number; width: number; height: number } {
		if (!meshRef) return { x: 0, y: 0, width: 0, height: 0 };
		const worldPos = new Vector3();
		meshRef.getWorldPosition(worldPos);
		const projected = worldPos.clone().project(camera);
		const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
		const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;

		// Estimate screen size from mesh world-space scale and camera distance
		const dist = camera.position.distanceTo(worldPos);
		const effectiveHeight = planeHeight * scale;
		const fov =
			'fov' in camera ? (camera as { fov: number }).fov : 50;
		const vFov = (fov * Math.PI) / 180;
		const screenH = (effectiveHeight / (2 * dist * Math.tan(vFov / 2))) * window.innerHeight;
		const screenW = screenH * (planeWidth / planeHeight);

		return {
			x: sx - screenW / 2,
			y: sy - screenH / 2,
			width: screenW,
			height: screenH
		};
	}

	export function getMesh(): Mesh | null {
		return meshRef;
	}

	export function getPlaneHeight(): number {
		return planeHeight;
	}

	export function getPlaneWidth(): number {
		return planeWidth;
	}

	export function setShadowOpacity(value: number): void {
		shadowOpacity = value;
	}

	// Sprite sheet scaling constants
	const REFERENCE_HEIGHT = 96;
	const WORLD_UNIT_SCALE = 0.8;

	let texture = $state<Texture | null>(null);
	let material = $state<MeshStandardMaterial | null>(null);
	let meshRef = $state<Mesh | null>(null);
	let meta = $state<SheetMetadata | null>(null);
	let animFrame = $state(0);
	let animElapsed = $state(0);
	/** Tracks the material's current opacity for shadow sync. Updated by proxy sync(). */
	let shadowOpacity = $state(0);

	// Derived plane dimensions based on sprite pixel size
	let planeHeight = $derived.by(() => {
		if (!meta) return WORLD_UNIT_SCALE;
		return (meta.frameHeight / REFERENCE_HEIGHT) * WORLD_UNIT_SCALE;
	});

	let planeWidth = $derived.by(() => {
		if (!meta) return WORLD_UNIT_SCALE;
		const aspect = meta.frameWidth / meta.frameHeight;
		return planeHeight * aspect;
	});

	let shadowRadius = $derived(planeWidth * 0.35 * scale);

	// Create material with custom shader patches for battle effects
	function createBattleMaterial(tex: Texture): MeshStandardMaterial {
		const mat = new MeshStandardMaterial({
			map: tex,
			transparent: true,
			alphaTest: 0.5,
			side: DoubleSide,
			opacity: 0,
			depthTest: false,
			depthWrite: false
		});

		// Add custom uniforms for battle visual effects
		mat.userData.uniforms = {
			u_brightness: { value: brightness },
			u_hueRotate: { value: hueRotate },
			u_tintColor: { value: new Color(tintColor) },
			u_tintAmount: { value: tintAmount }
		};

		mat.onBeforeCompile = (shader) => {
			// Inject our custom uniforms
			shader.uniforms.u_brightness = mat.userData.uniforms.u_brightness;
			shader.uniforms.u_hueRotate = mat.userData.uniforms.u_hueRotate;
			shader.uniforms.u_tintColor = mat.userData.uniforms.u_tintColor;
			shader.uniforms.u_tintAmount = mat.userData.uniforms.u_tintAmount;

			// Add uniform declarations to fragment shader
			shader.fragmentShader = shader.fragmentShader.replace(
				'void main() {',
				`
				uniform float u_brightness;
				uniform float u_hueRotate;
				uniform vec3 u_tintColor;
				uniform float u_tintAmount;

				vec3 battleHueRotate(vec3 color, float angle) {
					float rad = angle * 3.14159265 / 180.0;
					float cosA = cos(rad);
					float sinA = sin(rad);
					mat3 hueRotation = mat3(
						0.299 + 0.701 * cosA + 0.168 * sinA,
						0.587 - 0.587 * cosA + 0.330 * sinA,
						0.114 - 0.114 * cosA - 0.497 * sinA,
						0.299 - 0.299 * cosA - 0.328 * sinA,
						0.587 + 0.413 * cosA + 0.035 * sinA,
						0.114 - 0.114 * cosA + 0.292 * sinA,
						0.299 - 0.300 * cosA + 1.250 * sinA,
						0.587 - 0.588 * cosA - 1.050 * sinA,
						0.114 + 0.886 * cosA - 0.203 * sinA
					);
					return clamp(hueRotation * color, 0.0, 1.0);
				}

				void main() {
				`
			);

			// Apply battle effects after standard PBR lighting output
			shader.fragmentShader = shader.fragmentShader.replace(
				'#include <dithering_fragment>',
				`
				#include <dithering_fragment>

				// Apply brightness
				gl_FragColor.rgb *= u_brightness;

				// Apply hue rotation
				if (abs(u_hueRotate) > 0.01) {
					gl_FragColor.rgb = battleHueRotate(gl_FragColor.rgb, u_hueRotate);
				}

				// Apply tint
				if (u_tintAmount > 0.001) {
					gl_FragColor.rgb = mix(gl_FragColor.rgb, u_tintColor, u_tintAmount);
				}
				`
			);
		};

		return mat;
	}

	// Load sprite sheet and metadata when spriteName/spriteDir changes
	$effect(() => {
		const sheetPath = `src/assets/monsters/showdown/sheets/${spriteDir}/${spriteName}.png`;
		const metaPath = `src/assets/monsters/showdown/sheets/${spriteDir}/${spriteName}.json`;

		// Reset animation state
		animFrame = 0;
		animElapsed = 0;

		fetch(metaPath)
			.then((r) => r.json())
			.then((metaData: SheetMetadata) => {
				meta = metaData;

				const loader = new TextureLoader();
				const tex = loader.load(sheetPath);
				tex.magFilter = NearestFilter;
				tex.minFilter = NearestFilter;
				tex.colorSpace = SRGBColorSpace;

				// Horizontal strip: show one frame at a time
				const totalWidth = metaData.frameWidth * metaData.frameCount;
				tex.repeat.set(metaData.frameWidth / totalWidth, 1.0);
				tex.offset.set(0, 0);

				texture = tex;
				material = createBattleMaterial(tex);
				console.log(`[BattleSprite] ${slotId} loaded: ${spriteDir}/${spriteName} frames=${metaData.frameCount} size=${metaData.frameWidth}x${metaData.frameHeight}`);
			})
			.catch((err) => {
				console.error(`[BattleSprite] ${slotId} FAILED to load ${spriteDir}/${spriteName}:`, err);
			});
	});

	// Sync reactive props to material uniforms
	$effect(() => {
		if (!material?.userData?.uniforms) return;
		material.userData.uniforms.u_brightness.value = brightness;
		material.userData.uniforms.u_hueRotate.value = hueRotate;
		material.userData.uniforms.u_tintColor.value.set(tintColor);
		material.userData.uniforms.u_tintAmount.value = tintAmount;
		// Note: material.opacity is managed by sprite-3d-proxy sync() via GSAP
		material.needsUpdate = false; // uniforms update without full recompile
	});

	// Frame animation loop (key must be unique per instance)
	useTask(`battle-sprite-anim-${slotId}`, (delta) => {
		if (!texture || !meta || meta.frameCount <= 1) return;

		animElapsed += delta * 1000; // convert to ms
		const frameDuration = meta.durations[animFrame] || 100;

		if (animElapsed >= frameDuration) {
			animElapsed -= frameDuration;
			animFrame = (animFrame + 1) % meta.frameCount;
			const totalWidth = meta.frameWidth * meta.frameCount;
			texture.offset.x = (animFrame * meta.frameWidth) / totalWidth;
		}
	});
</script>

{#if texture && material && visible}
	<!-- Ground shadow circle -->
	<T.Mesh
		position.x={position[0]}
		position.y={position[1] - planeHeight * scale * 0.5}
		position.z={position[2]}
		rotation.x={-Math.PI / 2}
		renderOrder={100}
	>
		<T.CircleGeometry args={[shadowRadius, 16]} />
		<T.MeshBasicMaterial
			color="#000000"
			transparent
			opacity={0.25 * shadowOpacity}
			depthWrite={false}
			depthTest={false}
		/>
	</T.Mesh>

	<!-- Animated sprite billboard — position is handled by the sync task
	     (proxy.sync() sets mesh.parent position). Using [0,0,0] here to avoid
	     Threlte's outer wrapper Group doubling the position. -->
	<Billboard position={[0, 0, 0]}>
		<T.Mesh
			bind:ref={meshRef}
			scale={[planeWidth * scale, planeHeight * scale, 1]}
			material={material}
			renderOrder={101}
		>
			<T.PlaneGeometry args={[1, 1]} />
		</T.Mesh>
	</Billboard>
{/if}
