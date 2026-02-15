<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import {
		EffectComposer,
		RenderPass,
		EffectPass,
		TiltShiftEffect,
		BlendFunction,
		KernelSize
	} from 'postprocessing';

	const { renderer, scene, camera, renderStage, autoRenderTask, size } = useThrelte();

	// Disable default rendering
	autoRenderTask.stop();

	const composer = new EffectComposer(renderer);

	// Create passes
	const renderPass = new RenderPass(scene, $camera);
	const tiltShiftEffect = new TiltShiftEffect({
		blendFunction: BlendFunction.NORMAL,
		offset: 0,
		rotation: 0,
		focusArea: 0.4,
		feather: 0.3,
		bias: 0.06,
		kernelSize: KernelSize.SMALL
	});
	const effectPass = new EffectPass($camera, tiltShiftEffect);

	composer.addPass(renderPass);
	composer.addPass(effectPass);

	// Handle camera changes
	$effect(() => {
		renderPass.mainCamera = $camera;
		effectPass.mainCamera = $camera;
	});

	// Handle resize
	$effect(() => {
		composer.setSize($size.width, $size.height);
	});

	// Render loop
	useTask(
		(delta) => {
			composer.render(delta);
		},
		{ stage: renderStage, autoInvalidate: true }
	);
</script>

<!-- No template needed for renderer -->
