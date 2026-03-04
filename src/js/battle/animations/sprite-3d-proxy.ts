import gsap from 'gsap';
import type { Mesh, Camera, MeshStandardMaterial } from 'three';
import { Vector3 } from 'three';

/**
 * A proxy DOM element that bridges CSS/GSAP animations to Three.js.
 *
 * The AnimationEngine and move animations operate on this proxy element
 * via GSAP (setting x, y, scale, filter, opacity, rotation).
 * Every frame, `sync()` reads the current GSAP-animated state from
 * the proxy and applies it to the Three.js mesh/material.
 *
 * This approach means the existing AnimationEngine works completely
 * unchanged — it just animates DOM elements as usual.
 */
export class Sprite3DProxy {
	readonly element: HTMLElement;
	private mesh: Mesh | null = null;
	private camera: Camera | null = null;
	private homeWorldPos = new Vector3();
	private _baseScreenWidth = 0;
	private _baseScreenHeight = 0;
	private _homeScale = 1;

	constructor() {
		this.element = document.createElement('div');
		this.element.style.cssText = `
			position: fixed;
			pointer-events: none;
			z-index: -9999;
			visibility: hidden;
		`;
		document.body.appendChild(this.element);
		// Set GSAP initial values so sync() reads correct defaults.
		// Start with opacity 0 so the 3D mesh is invisible until the
		// entrance animation explicitly fades it in.
		gsap.set(this.element, { opacity: 0, scale: 1 });
	}

	/**
	 * Bind this proxy to a Three.js mesh and camera.
	 * Must be called after the mesh is created.
	 */
	bind(mesh: Mesh, camera: Camera, homeWorldPos: Vector3, homeScale: number): void {
		this.mesh = mesh;
		this.camera = camera;
		this.homeWorldPos.copy(homeWorldPos);
		this._homeScale = homeScale;
	}

	/**
	 * Update the home position and scale every frame.
	 * Used when positions are computed dynamically from camera unprojection.
	 */
	updateHome(worldPos: Vector3, scale: number): void {
		this.homeWorldPos.copy(worldPos);
		this._homeScale = scale;
	}

	/**
	 * Update the proxy element's CSS position to match the 3D sprite's
	 * projected screen position. Call this before GSAP animations read
	 * getBoundingClientRect().
	 */
	updateBasePosition(): void {
		if (!this.mesh || !this.camera) return;

		const screenPos = this.homeWorldPos.clone().project(this.camera);
		const sx = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
		const sy = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

		// Estimate screen size from world-space mesh scale and camera distance
		const dist = this.camera.position.distanceTo(this.homeWorldPos);
		if (dist < 0.01) return;

		const fov =
			'fov' in this.camera ? (this.camera as { fov: number }).fov : 50;
		const vFov = (fov * Math.PI) / 180;
		const worldHeight = this.mesh.scale.y;
		const screenH = (worldHeight / (2 * dist * Math.tan(vFov / 2))) * window.innerHeight;
		const screenW = screenH * (this.mesh.scale.x / this.mesh.scale.y);

		this._baseScreenWidth = screenW;
		this._baseScreenHeight = screenH;

		// Position proxy at the center of the sprite's screen projection
		this.element.style.left = `${sx - screenW / 2}px`;
		this.element.style.top = `${sy - screenH / 2}px`;
		this.element.style.width = `${screenW}px`;
		this.element.style.height = `${screenH}px`;
	}

	/**
	 * Read GSAP-animated state from the proxy element and apply to 3D mesh.
	 * Call this every frame after GSAP has updated.
	 */
	sync(): void {
		if (!this.mesh || !this.camera) return;

		// Read GSAP transform values
		const gsapX = (gsap.getProperty(this.element, 'x') as number) || 0;
		const gsapY = (gsap.getProperty(this.element, 'y') as number) || 0;
		const gsapScale = (gsap.getProperty(this.element, 'scale') as number) ?? 1;
		const gsapOpacity = gsap.getProperty(this.element, 'opacity') as number;
		const filterStr = this.element.style.filter || '';

		// Convert pixel offsets to world-space displacement
		const dist = this.camera.position.distanceTo(this.homeWorldPos);
		const fov =
			'fov' in this.camera ? (this.camera as { fov: number }).fov : 50;
		const vFov = (fov * Math.PI) / 180;
		const worldPerPixel = (2 * dist * Math.tan(vFov / 2)) / window.innerHeight;

		// Apply position offset
		// Screen X → world X (roughly), Screen Y → world Y (inverted)
		const billboard = this.mesh.parent;
		if (billboard) {
			billboard.position.set(
				this.homeWorldPos.x + gsapX * worldPerPixel,
				this.homeWorldPos.y - gsapY * worldPerPixel,
				this.homeWorldPos.z
			);
		}

		// Apply scale (relative to home scale)
		const effectiveScale = this._homeScale * gsapScale;
		// Scale was applied to the mesh.scale which is planeWidth * scale, planeHeight * scale
		// We need to multiply the base dimensions by the ratio gsapScale/homeScale
		const baseScaleX = this.mesh.scale.x / (this._currentGSAPScale || 1);
		const baseScaleY = this.mesh.scale.y / (this._currentGSAPScale || 1);
		this.mesh.scale.set(baseScaleX * gsapScale, baseScaleY * gsapScale, 1);
		this._currentGSAPScale = gsapScale;

		// Apply material uniforms from CSS filter
		const mat = this.mesh.material as MeshStandardMaterial;
		if (mat?.userData?.uniforms) {
			// Parse brightness from filter
			const brightnessMatch = filterStr.match(/brightness\(([\d.]+)\)/);
			if (brightnessMatch) {
				mat.userData.uniforms.u_brightness.value = parseFloat(brightnessMatch[1]);
			} else if (!filterStr.includes('brightness')) {
				mat.userData.uniforms.u_brightness.value = 1;
			}

			// Parse hue-rotate from filter
			const hueMatch = filterStr.match(/hue-rotate\(([-\d.]+)deg\)/);
			if (hueMatch) {
				mat.userData.uniforms.u_hueRotate.value = parseFloat(hueMatch[1]);
			} else if (!filterStr.includes('hue-rotate')) {
				mat.userData.uniforms.u_hueRotate.value = 0;
			}
		}

		// Apply opacity
		if (typeof gsapOpacity === 'number' && !isNaN(gsapOpacity)) {
			mat.opacity = gsapOpacity;
		}
	}

	private _currentGSAPScale = 1;

	/** The GSAP scale factor from the last sync() call. */
	get currentGSAPScale(): number {
		return this._currentGSAPScale;
	}

	/**
	 * Reset the proxy to default state (no transforms, no filter).
	 */
	reset(): void {
		gsap.set(this.element, {
			x: 0,
			y: 0,
			scale: 1,
			opacity: 1,
			rotation: 0,
			clearProps: 'filter'
		});
		this._currentGSAPScale = 1;
	}

	dispose(): void {
		this.element.remove();
	}
}
