## UI/UX Design

- Implemented manga-inspired parallelogram buttons for move selector.
- Used `skewX` and `rotate` transforms to create dynamic shapes.
- Layered pseudo-elements (`::before`, `::after`) to create decorative borders without affecting layout flow.
- Used `color-mix` for sophisticated hover effects.
- **Gotcha**: `svelte-check` can OOM on large projects; rely on `vite build` for verification in such cases.
