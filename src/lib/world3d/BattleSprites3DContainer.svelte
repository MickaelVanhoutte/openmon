<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import BattlePokemonSprite3D from './BattlePokemonSprite3D.svelte';
	import type { BattleContext } from '$js/context/battleContext';
	import { BattlePositionSystem3D } from '$js/battle/animations/position-system-3d';
	import { Sprite3DProxy } from '$js/battle/animations/sprite-3d-proxy';
	import { battleScreenPositions, battleSpriteProxies, battleSpriteVersion, type ScreenSpritePosition } from '$js/battle/animations/sprite-screen-positions';
	import type { PokemonInstance } from '$js/pokemons/pokedex';
	import { PerspectiveCamera, Vector3 } from 'three';
	import { onDestroy, untrack } from 'svelte';

	interface Props {
		battleCtx: BattleContext;
		playerPosition: { x: number; y: number; z: number };
	}

	let { battleCtx, playerPosition }: Props = $props();

	const { camera } = useThrelte();

	// Position system — uses camera unprojection to compute fixed world positions
	const posSystem = new BattlePositionSystem3D();

	// Battle camera constants (must match GameCamera3D.svelte)
	const BATTLE_OFFSET = { x: 2, y: 1, z: 3 };
	const BATTLE_LOOKAT_OFFSET = { x: 1, y: 0.5, z: 0 };

	// Track sprites and proxies
	interface SpriteEntry {
		pokemon: PokemonInstance;
		side: 'player' | 'opponent';
		index: number;
		spriteName: string;
		spriteDir: string;
		worldPos: [number, number, number];
		scale: number;
		visible: boolean;
		proxy: Sprite3DProxy;
		spriteComponent: ReturnType<typeof BattlePokemonSprite3D> | null;
		/** Whether the world position has been computed and anchored */
		anchored: boolean;
	}

	let spriteEntries = $state<SpriteEntry[]>([]);

	// Track version from Battle.svelte to detect pokemon switches
	// (battleCtx.playerSide is a plain class property, not Svelte $state)
	let spriteVersion = $state(0);
	const unsubVersion = battleSpriteVersion.subscribe((v) => {
		spriteVersion = v;
	});

	// Export proxy elements so Battle.svelte can use them as sprite.element
	export function getProxyElements(): { ally: HTMLElement[]; opponent: HTMLElement[] } {
		const ally: HTMLElement[] = [];
		const opponent: HTMLElement[] = [];
		for (const entry of spriteEntries) {
			const arr = entry.side === 'player' ? ally : opponent;
			arr[entry.index] = entry.proxy.element;
		}
		return { ally, opponent };
	}

	export function getProxy(side: 'player' | 'opponent', index: number): Sprite3DProxy | undefined {
		return spriteEntries.find((e) => e.side === side && e.index === index)?.proxy;
	}

	/**
	 * Create a virtual camera at the ideal battle position for computing
	 * anchored world positions. This ensures positions are correct regardless
	 * of the actual camera transition state.
	 */
	function createBattleCamera(): PerspectiveCamera {
		const cam = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
		cam.position.set(
			playerPosition.x + BATTLE_OFFSET.x,
			playerPosition.y + BATTLE_OFFSET.y,
			playerPosition.z + BATTLE_OFFSET.z
		);
		cam.lookAt(
			playerPosition.x + BATTLE_LOOKAT_OFFSET.x,
			playerPosition.y + BATTLE_LOOKAT_OFFSET.y,
			playerPosition.z + BATTLE_LOOKAT_OFFSET.z
		);
		cam.updateMatrixWorld(true);
		cam.updateProjectionMatrix();
		return cam;
	}

	// Update layout when battle type changes
	$effect(() => {
		posSystem.setLayout(battleCtx.battleType === 1 ? 'DOUBLE' : 'SINGLE');
	});

	// Create/update sprite entries when battle sides change
	$effect(() => {
		// Read spriteVersion to re-run on pokemon switches
		void spriteVersion;

		// Read reactive dependencies (battle sides)
		const allPokemon: { pokemon: PokemonInstance; side: 'player' | 'opponent'; index: number }[] = [];

		battleCtx.playerSide.forEach((p, i) => {
			if (p) allPokemon.push({ pokemon: p, side: 'player', index: i });
		});
		battleCtx.oppSide.forEach((p, i) => {
			if (p) allPokemon.push({ pokemon: p, side: 'opponent', index: i });
		});

		// Read old entries without creating a dependency (prevents infinite loop)
		const oldEntries = untrack(() => spriteEntries);

		// Reconcile entries
		const newEntries: SpriteEntry[] = [];

		for (const { pokemon, side, index } of allPokemon) {
			const isBack = side === 'player';
			const spriteDir = pokemon.isShiny
				? (isBack ? 'ani-back-shiny' : 'ani-shiny')
				: (isBack ? 'ani-back' : 'ani');

			// Reuse existing entry if same pokemon in same slot
			const existing = oldEntries.find(
				(e) => e.side === side && e.index === index && e.pokemon === pokemon
			);

			if (existing) {
				existing.spriteDir = spriteDir;
				newEntries.push(existing);
			} else {
				// Clean up old proxy for this slot
				const old = oldEntries.find((e) => e.side === side && e.index === index);
				if (old) old.proxy.dispose();

				const proxy = new Sprite3DProxy();
				newEntries.push({
					pokemon,
					side,
					index,
					spriteName: pokemon.spriteName,
					spriteDir,
					worldPos: [0, 0, 0],
					scale: 1,
					visible: true,
					proxy,
					spriteComponent: null,
					anchored: false
				});
			}
		}

		// Dispose removed entries
		for (const old of oldEntries) {
			if (!newEntries.includes(old)) {
				old.proxy.dispose();
			}
		}

		spriteEntries = newEntries;

		// Publish proxy elements to store for Battle.svelte to use
		const allyProxies: HTMLElement[] = [];
		const opponentProxies: HTMLElement[] = [];
		for (const entry of newEntries) {
			if (entry.side === 'player') {
				allyProxies[entry.index] = entry.proxy.element;
			} else {
				opponentProxies[entry.index] = entry.proxy.element;
			}
		}
		battleSpriteProxies.set({ ally: allyProxies, opponent: opponentProxies });
	});

	// Sync loop: anchor positions once, then sync GSAP state + publish screen positions
	useTask(
		'battle-sprite-sync',
		() => {
			if (!$camera || spriteEntries.length === 0) return;

			const cam = $camera as PerspectiveCamera;
			cam.updateMatrixWorld(true);

			const allyPositions: ScreenSpritePosition[] = [];
			const opponentPositions: ScreenSpritePosition[] = [];

			for (const entry of spriteEntries) {
				// Compute and anchor the world position ONCE per sprite
				if (!entry.anchored) {
					const slot = { side: entry.side, index: entry.index };
					// Use a virtual camera at the ideal battle position for consistent placement
					const battleCam = createBattleCamera();
					const { position: worldPos, scale: computedScale } =
						posSystem.computeWorldPosition(slot, battleCam);

					const spritePlaneH = entry.spriteComponent?.getPlaneHeight() ?? 0.8;
					const adjustedScale = (computedScale * 0.8) / spritePlaneH;

					// Anchor sprite to the ground tile surface. playerPosition.y includes
					// a +0.5 entity offset, so subtract it to get the actual tile top.
					// Then place the sprite so its bottom edge sits on the ground.
					const spriteWorldHeight = spritePlaneH * adjustedScale;
					const groundLevel = playerPosition.y - 0.5;
					worldPos.y = groundLevel + spriteWorldHeight * 0.5;

					entry.worldPos = [worldPos.x, worldPos.y, worldPos.z];
					entry.scale = adjustedScale;
					entry.anchored = true;
				}

				const worldPos = new Vector3(entry.worldPos[0], entry.worldPos[1], entry.worldPos[2]);

				// Get sprite dimensions for mesh scale
				const spritePlaneH = entry.spriteComponent?.getPlaneHeight() ?? 0.8;
				const spritePlaneW = entry.spriteComponent?.getPlaneWidth() ?? 0.8;

				// Bind or rebind proxy to mesh
				const mesh = entry.spriteComponent?.getMesh() ?? null;
				if (mesh) {
					const currentProxyMesh = entry.proxy['mesh'] as any;
					if (!currentProxyMesh || currentProxyMesh !== mesh) {
						entry.proxy.bind(mesh, cam, worldPos, entry.scale);
					}
				}

				// Update proxy home position every frame (for screen projection)
				entry.proxy.updateHome(worldPos, entry.scale);

				// Set base mesh scale before sync so GSAP can adjust relative to it
				if (mesh) {
					mesh.scale.set(
						spritePlaneW * entry.scale,
						spritePlaneH * entry.scale,
						1
					);
				}

				// Update proxy's base screen position (before GSAP reads)
				entry.proxy.updateBasePosition();

				// Sync GSAP state → Three.js mesh (handles billboard position + scale)
				entry.proxy.sync();

				// Sync shadow opacity: combine material opacity with GSAP scale
				// so the shadow fades during both shrink and fade-out animations
				if (mesh) {
					const mat = mesh.material as import('three').MeshStandardMaterial;
					const gsapScale = Math.min(1, entry.proxy.currentGSAPScale);
					entry.spriteComponent?.setShadowOpacity(mat.opacity * gsapScale);
				}

				// Compute screen position for HP bar placement
				const bounds = entry.spriteComponent?.getScreenBounds(cam);
				const screenPos: ScreenSpritePosition = bounds
					? { ...bounds, visible: entry.visible }
					: { x: 0, y: 0, width: 0, height: 0, visible: false };

				if (entry.side === 'player') {
					allyPositions[entry.index] = screenPos;
				} else {
					opponentPositions[entry.index] = screenPos;
				}
			}

			battleScreenPositions.set({ ally: allyPositions, opponent: opponentPositions });
		},
		{ autoInvalidate: false }
	);

	// Cleanup all proxies on destroy
	onDestroy(() => {
		unsubVersion();
		for (const entry of spriteEntries) {
			entry.proxy.dispose();
		}
		battleScreenPositions.set({ ally: [], opponent: [] });
		battleSpriteProxies.set({ ally: [], opponent: [] });
	});
</script>

{#each spriteEntries as entry (`${entry.side}-${entry.index}`)}
	<BattlePokemonSprite3D
		bind:this={entry.spriteComponent}
		slotId={`${entry.side}-${entry.index}`}
		spriteName={entry.spriteName}
		spriteDir={entry.spriteDir}
		position={entry.worldPos}
		scale={entry.scale}
		visible={entry.visible}
	/>
{/each}
