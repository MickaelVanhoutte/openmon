# Battle Field Effects Animation

## TL;DR

> **Quick Summary**: Add visual animations for battle field effects - weather overlays (rain, sun, sand, hail), persistent hazard graphics (spikes/caltrops on ground, floating rocks), and screen visual barriers.
>
> **Deliverables**:
>
> - Weather overlay system with particle effects
> - Hazard sprites that persist on the battlefield
> - Screen visual effects (shimmering barriers)
> - Smooth transitions when effects are added/removed
>
> **Estimated Effort**: Medium-High (visual-engineering category)

---

## Context

### Current State

- `FieldIndicators.svelte` exists with **text-only indicators** (e.g., "Rain 5", "SR", "Spikes x2")
- `Battle.svelte` has animation infrastructure using GSAP
- No visual overlays or particle effects for weather
- No visual sprites for hazards on the field

### Target State

- Weather effects shown as animated overlays (rain drops falling, sun rays, sand particles, ice crystals)
- Hazards shown as persistent sprites on each side of the field (caltrops for spikes, floating rocks for stealth rock)
- Screens shown as translucent barriers protecting each side

---

## Work Objectives

### Core Deliverables

1. **Weather Overlay Component**
   - Rain: Animated falling droplets overlay
   - Sun: Golden rays/glow overlay with subtle animation
   - Sandstorm: Swirling sand particles, slight screen tint
   - Hail: Falling ice crystal particles

2. **Hazard Visuals**
   - Stealth Rock: Floating jagged rocks near the Pokemon
   - Spikes: Caltrop/spike sprites scattered on ground (1-3 based on layers)
   - Toxic Spikes: Purple-tinted spikes with subtle glow

3. **Screen Visuals**
   - Reflect: Blue shimmering barrier in front of ally/enemy
   - Light Screen: Golden shimmering barrier

4. **Animations**
   - Entry animation when effect is set
   - Exit animation when effect is removed
   - Looping animation while active

---

## TODOs

- [x] 1. Create WeatherOverlay.svelte Component

  **What to do**:
  - Create new component for weather visual effects
  - Implement CSS-based particle animations for each weather type
  - Rain: Use pseudo-elements or divs with falling animation
  - Sun: Radial gradient with pulsing glow
  - Sand: Particle swirl with brownish tint
  - Hail: Falling ice crystals similar to rain but larger

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

- [x] 2. Create HazardSprites.svelte Component

  **What to do**:
  - Create component to render hazard visuals on each side
  - Stealth Rock: Use SVG or CSS for floating rock shapes
  - Spikes: Caltrop/spike shapes scattered at ground level
  - Toxic Spikes: Similar to spikes but purple with glow
  - Number of sprites scales with layer count

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

- [x] 3. Create ScreenBarrier.svelte Component

  **What to do**:
  - Create translucent barrier visual for Reflect/Light Screen
  - Reflect: Blue tint, subtle shimmer animation
  - Light Screen: Golden tint, subtle shimmer animation
  - Position at side boundary, covering the Pokemon area

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: `["frontend-ui-ux"]`

- [x] 4. Integrate Components into Battle.svelte

  **What to do**:
  - Import and place new components in Battle.svelte
  - Pass battleField prop to each component
  - Ensure proper z-index layering (behind Pokemon, above background)

- [x] 5. Add Entry/Exit Animations

  **What to do**:
  - GSAP or CSS transitions for when effects appear/disappear
  - Weather: Fade in overlay
  - Hazards: Rocks/spikes fall into place from above
  - Screens: Shimmer effect expanding outward

- [ ] 6. Update FieldIndicators to Be Optional

  **What to do**:
  - Keep text indicators as fallback/debug option
  - Add prop to hide when visual effects are active
  - Or overlay turn counters on the visual effects

- [x] 7. Test and Polish

  **What to do**:
  - Test all weather types
  - Test hazard layer scaling
  - Test screen appearance on both sides
  - Ensure no performance issues with animations
  - Verify build passes

---

## Success Criteria

- [ ] Weather effects display animated overlay when active
- [ ] Hazards show visual sprites on affected side
- [ ] Screens show barrier effect on affected side
- [ ] Animations are smooth (60fps target)
- [ ] Build passes
- [ ] No performance degradation
