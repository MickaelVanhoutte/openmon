<script lang="ts">
	import { T } from '@threlte/core';
	import type { DirectionalLight } from 'three';
</script>

<T.DirectionalLight
	position={[8, 12, 8]}
	intensity={1.2}
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

<T.AmbientLight intensity={0.3} />

<T.HemisphereLight args={[0x87ceeb, 0x362907, 0.3]} />
