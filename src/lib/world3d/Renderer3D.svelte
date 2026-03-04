<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import { EffectComposer, RenderPass } from 'postprocessing';

	const { renderer, scene, camera, renderStage, autoRenderTask, size } = useThrelte();

	// Disable default rendering
	autoRenderTask.stop();

	const composer = new EffectComposer(renderer);

	// Create passes
	const renderPass = new RenderPass(scene, $camera);
	composer.addPass(renderPass);

	// Handle camera changes
	$effect(() => {
		renderPass.mainCamera = $camera;
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
