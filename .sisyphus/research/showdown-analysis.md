# Pokemon Showdown Animation System Analysis

**Repository:** https://github.com/smogon/pokemon-showdown-client  
**Commit SHA:** 4428a1444c3d39e915b7c7a19c5c76565da5aba3  
**Analysis Date:** January 29, 2026

## Executive Summary

Pokemon Showdown uses a jQuery-based animation engine with custom easing functions and a sprite-based effects system. Their architecture separates concerns cleanly:
- **BattleScene** class manages animation state and timing
- **BattleMoveAnims** defines 38,444 lines of move-specific animations
- **BattleEffects** catalog of 50+ reusable effect sprites
- **Custom easings** for ballistic/quadratic motion (4 functions)

---

## 1. Architecture Overview

### Core Components

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| BattleScene | `battle-animations.ts` | 6,194 | Animation orchestration, timing, effects display |
| BattleMoveAnims | `battle-animations-moves.ts` | 38,444 | Move-specific animation definitions |
| BattleEffects | `battle-animations.ts` (L2944-3201) | ~257 | Sprite catalog with dimensions |
| Easing Functions | `battle-animations.ts` (L2920-2935) | 15 | Custom jQuery easing extensions |

### Animation Flow

```
Move Execution
    ↓
runMoveAnim(moveId, participants)
    ↓
BattleMoveAnims[moveId].anim(scene, [attacker, defender])
    ↓
scene.showEffect(effectName, startPos, endPos, transition, after)
    ↓
scene.animateEffect($effect, ...) → jQuery.animate() with custom easings
    ↓
scene.waitFor($effect) → Tracks active animations
```

### Key Design Patterns

1. **Position System:**
   - 3D coordinates: `{x, y, z, scale, opacity, time}`
   - `z` determines depth (0 = near, 200 = far)
   - `pos()` converts PS coords → jQuery CSS
   - `posT()` adds easing transitions

2. **Timing Model:**
   - `timeOffset` accumulates delays
   - `scene.wait(ms)` adds global delays
   - `sprite.delay(ms)` adds per-sprite delays
   - Animations chain via jQuery's `.delay()` and `.animate()`

3. **Effect Lifecycle:**
   ```javascript
   showEffect(name, start, end, transition, after)
   // 'after' can be: 'fade' | 'explode' | undefined
   ```

---

## 2. Easing Functions

Pokemon Showdown extends jQuery's easing with 4 custom functions for realistic motion physics.

### Ballistic Easing (Parabolic Motion)

**Purpose:** Simulate thrown objects with gravity (arcing trajectory)

#### ballisticUp
```javascript
ballisticUp(x) {
    return -3 * x * x + 4 * x;
}
```
- **Math:** Inverted parabola with peak at x=0.667
- **Use Case:** Upward arc (defender above attacker)
- **Range:** f(0)=0, f(0.667)≈1.33, f(1)=1
- **Velocity:** Starts fast, slows at apex, accelerates down

#### ballisticDown
```javascript
ballisticDown(x) {
    x = 1 - x;
    return 1 - (-3 * x * x + 4 * x);
}
```
- **Math:** Reflected ballisticUp
- **Use Case:** Downward arc (defender below attacker)
- **Behavior:** Mirror image of ballisticUp

### Quadratic Easing (Ease In/Out)

#### quadUp (Ease Out)
```javascript
quadUp(x) {
    x = 1 - x;
    return 1 - (x * x);
}
```
- **Math:** `y = 1 - (1-x)²`
- **Curve:** Deceleration (fast start, slow end)
- **Use Case:** Gentle arrivals, settling effects

#### quadDown (Ease In)
```javascript
quadDown(x) {
    return x * x;
}
```
- **Math:** `y = x²`
- **Curve:** Acceleration (slow start, fast end)
- **Use Case:** Objects gaining momentum, impacts

### Transition Keywords

| Keyword | Easing Applied | Use Case |
|---------|---------------|----------|
| `ballistic` | top: ballisticUp/Down (auto-detect) | Projectiles with arc |
| `ballisticUnder` | Inverted ballistic | Under-arc throws |
| `ballistic2` | top: quadUp/Down | Simplified arc (less pronounced) |
| `ballistic2Back` | quadUp/Down (return trip) | Return animations |
| `swing` | All: 'swing' (jQuery native) | Smooth pendulum motion |
| `accel` | All: quadDown | Accelerating motion |
| `decel` | All: quadUp | Decelerating motion |
| `linear` | All: linear | Constant speed |

---

## 3. Animation Patterns by Move Type

### Pattern Analysis (from battle-animations-moves.ts)

#### Physical Moves (Dash Pattern)
```javascript
// Example: Tackle (L1064-1088)
tackle: {
    anim(scene, [attacker, defender]) {
        attacker.anim({
            x: defender.x,
            y: defender.y,
            z: defender.behind(5),
            time: 400
        }, 'ballistic');
        attacker.anim({
            x: attacker.x,
            y: attacker.y,
            z: attacker.behind(5),
            time: 400
        }, 'ballistic2Back');
        
        defender.delay(425);
        defender.anim({x: defender.x - 5, time: 75}, 'swing');
        defender.anim({x: defender.x + 5, time: 100}, 'swing');
        defender.anim({x: defender.x, time: 75}, 'swing');
    }
}
```
**Pattern:** Attacker dashes → Impact → Return → Defender recoil shake

#### Special Moves (Projectile Pattern)
```javascript
// Example: Flamethrower (L16896+)
flamethrower: {
    anim(scene, [attacker, defender]) {
        scene.showEffect('fireball', {
            x: attacker.x,
            y: attacker.y,
            z: attacker.z,
            scale: 0.4,
            opacity: 0.6
        }, {
            x: defender.x,
            y: defender.y,
            z: defender.behind(20),
            scale: 0.6,
            opacity: 1,
            time: 500
        }, 'linear', 'explode');
    }
}
```
**Pattern:** Effect spawns at attacker → Travels to defender → 'explode' (3x scale + fade)

#### Status Moves (On-Target Pattern)
```javascript
// Example: Swagger (L200-239)
swagger: {
    anim(scene, [attacker, defender]) {
        BattleOtherAnims.shake.anim(scene, [attacker]);
        
        for (let i = 0; i < 3; i++) {
            scene.showEffect('angry', {
                x: defender.x + offsets[i].x,
                y: defender.y + offsets[i].y,
                z: defender.z,
                scale: 0.5,
                opacity: 0.5,
                time: i * 100
            }, {
                scale: 1,
                opacity: 1,
                time: (i * 100) + 300
            }, 'ballistic2Under', 'fade');
        }
    }
}
```
**Pattern:** Attacker reacts → Multiple effects spawn around defender over time

### Common Timing Conventions

| Duration | Purpose |
|----------|---------|
| 75-100ms | Quick recoil shakes |
| 300-400ms | Standard dash/projectile travel |
| 500ms | Long-distance projectiles |
| 600-800ms | Multi-hit sequences |
| 200ms | Staggered effect spawns (time offset) |

---

## 4. Effect Sprite Inventory

### Complete Showdown `/fx/` Catalog (139 PNG files)

#### Core Combat Effects (26)
```
✓ Have | Name           | Size (WxH) | Use Case
-------|----------------|------------|------------------
✓      | wisp.png       | 100x100    | Generic energy
✓      | poisonwisp.png | 100x100    | Poison effects
✓      | fireball.png   | 64x64      | Fire projectiles
✓      | iceball.png    | 100x100    | Ice projectiles
✓      | icicle.png     | 80x60      | Ice shards
✓      | lightning.png  | 41x229     | Electric bolts
✓      | shadowball.png | 100x100    | Ghost/Dark projectiles
✓      | energyball.png | 100x100    | Grass projectiles
✓      | electroball.png| 100x100    | Electric sphere
✗      | mistball.png   | 100x100    | Psychic mist
✗      | waterwisp.png  | 100x100    | Water effects
✗      | mudwisp.png    | 100x100    | Ground/mud
✗      | blackwisp.png  | 100x100    | Dark energy
✗      | bluefireball.png| 64x64     | Special fire variant
✗      | flareball.png  | 100x100    | Intense fire
```

#### Physical Attack Effects (14)
```
✓ Have | Name           | Size (WxH) | Use Case
-------|----------------|------------|------------------
✓      | fist.png       | 55x49      | Punches
✓      | fist1.png      | 49x55      | Alt punch angle
✓      | foot.png       | 50x75      | Kicks
✓      | leftclaw.png   | 44x60      | Slash attacks
✓      | rightclaw.png  | 44x60      | Slash attacks
✗      | leftslash.png  | 57x56      | Cutting moves
✗      | rightslash.png | 57x56      | Cutting moves
✗      | leftchop.png   | 100x130    | Karate chops
✗      | rightchop.png  | 100x130    | Karate chops
✗      | topbite.png    | 108x64     | Bite (upper jaw)
✗      | bottombite.png | 108x64     | Bite (lower jaw)
✓      | impact.png     | 127x119    | Impact burst
✗      | hitmarker.png  | 100x100    | Hit indicator
✗      | sword.png      | 48x100     | Sword slash
```

#### Rocks & Terrain (4)
```
✗ rocks.png      | 100x100  | Stealth Rock
✗ rock1.png      | 64x80    | Individual rock
✗ rock2.png      | 66x72    | Rock variant
✗ rock3.png      | 66x72    | Rock variant
```

#### Status & Emotions (7)
```
✓ angry.png      | 30x30    | Confusion/Taunt
✓ heart.png      | 30x30    | Attract/Affection
✗ stare.png      | 100x35   | Leer/Glare
✗ pointer.png    | 100x100  | Taunt indicator
✗ shine.png      | 127x119  | Flash/Sparkle
✓ feather.png    | 100x38   | Flying/Lightness
✗ web.png        | 120x122  | Spider Web
```

#### Hazards & Field Effects (5)
```
✓ caltrop.png      | 80x80   | Spikes
✗ poisoncaltrop.png| 80x80   | Toxic Spikes
✗ greenmetal1.png  | 45x45   | Steel hazards
✗ greenmetal2.png  | 45x45   | Steel hazards alt
✓ bone.png         | 29x29   | Bone Rush
```

#### Misc Effects (11)
```
✗ moon.png       | 100x100  | Lunar effects
✗ rainbow.png    | 128x128  | Weather/field
✗ alpha.png      | 80x80    | Primal Groudon
✗ omega.png      | 80x80    | Primal Kyogre
✗ ultra.png      | 113x165  | Ultra Burst
✗ z-symbol.png   | 150x100  | Z-Moves
✗ pokeball.png   | 24x24    | Ball throws
✗ gear.png       | 100x100  | Gear Grind
✗ shell.png      | 100x91   | Clamp/defense
✗ petal.png      | 60x60    | Petal Dance
✓ leaf1.png      | 32x26    | Grass moves
✓ leaf2.png      | 40x26    | Grass moves
```

#### Weather Overlays (8)
```
✗ weather-hail.png
✗ weather-sandstorm.png
✗ weather-strongwind.png
✗ weather-electricterrain.png
✗ weather-grassyterrain.png
✗ weather-mistyterrain.png
✗ weather-psychicterrain.png
✗ weather-gravity.png
✗ weather-trickroom.png
✗ weather-magicroom.png
✗ weather-wonderroom.png
```

#### Backgrounds (38 files)
All `bg-*.png` and `bg-*.jpg` files for different battle arenas (gen1-4, terrains)

### Missing from Our Project (Priority List)

**High Priority (Common moves):**
1. `waterwisp.png` - Water Gun, Surf, Hydro Pump
2. `mudwisp.png` - Mud Shot, Earth Power
3. `leftslash.png` / `rightslash.png` - Slash, Night Slash, X-Scissor
4. `leftchop.png` / `rightchop.png` - Better karate chop animations
5. `mistball.png` - Psychic projectiles
6. `flareball.png` - Fire Blast, Overheat

**Medium Priority:**
7. `topbite.png` / `bottombite.png` - Bite, Crunch (we have crunch-sprite but could use theirs)
8. `rocks.png` + variants - Rock Tomb, Stealth Rock
9. `poisoncaltrop.png` - Toxic Spikes
10. `web.png` - Spider Web

**Low Priority (Niche moves):**
11. Weather overlays (we don't have weather yet)
12. Z-Move/Ultra graphics (Gen 7+ features)

---

## 5. Position System Deep Dive

### Coordinate Space

```javascript
// Showdown's 3D positioning
{
    x: number,      // Horizontal (-∞ to +∞, 0 = center)
    y: number,      // Vertical (-∞ to +∞, 0 = baseline)
    z: number,      // Depth (0 = near player, 200 = far opponent)
    scale: number,  // Uniform scale (1 = 100%)
    xscale: number, // Horizontal stretch (overrides scale)
    yscale: number, // Vertical stretch (overrides scale)
    opacity: number // 0-1
}
```

### Conversion to CSS (`pos()` method, L352-390)

```javascript
pos(loc, obj) {
    // Apply depth perspective
    let scale = (obj.gen === 5 ? 
        2.0 - (loc.z / 200) : 
        1.5 - 0.5 * (loc.z / 200));
    
    // Perspective shifts
    let left = 210 + (410 - 190) * (loc.z / 200);
    let top = 245 + (135 - 245) * (loc.z / 200);
    
    // Apply position with scale
    left += Math.floor(loc.x * scale);
    top -= Math.floor(loc.y * scale);
    
    // Calculate sprite dimensions
    let width = Math.floor(obj.w * scale * loc.xscale);
    let height = Math.floor(obj.h * scale * loc.yscale);
    
    return {left, top, width, height, opacity: loc.opacity};
}
```

**Key Insight:** Showdown's perspective creates depth illusion by:
1. Scaling sprites based on z-distance
2. Shifting position toward center/top as z increases
3. Different perspective for Gen 5 sprites (more pronounced)

---

## 6. Recommendations for OpenMon

### Architectural Adaptations

#### 1. Replace jQuery with GSAP
```javascript
// Showdown (jQuery)
$effect.animate({left: 100, top: 50}, 500, 'ballisticUp');

// OpenMon (GSAP equivalent)
gsap.to($effect, {
    x: 100,
    y: 50,
    duration: 0.5,
    ease: CustomEase.create("ballisticUp", 
        t => -3 * t * t + 4 * t
    )
});
```

#### 2. Port Easing Functions to GSAP CustomEase
```javascript
// Create once at initialization
const ballisticUp = CustomEase.create("ballisticUp", 
    t => -3 * t * t + 4 * t);
const ballisticDown = CustomEase.create("ballisticDown", 
    t => { const x = 1 - t; return 1 - (-3 * x * x + 4 * x); });
const quadUp = CustomEase.create("quadUp", 
    t => 1 - (1 - t) * (1 - t));
const quadDown = CustomEase.create("quadDown", 
    t => t * t);
```

#### 3. Adopt Position System
- Keep our current sprite-sheet approach (more efficient)
- BUT adopt Showdown's position→CSS conversion for effects
- Use `z` coordinate for depth sorting

#### 4. Animation Pattern Library
Create helper methods matching Showdown's patterns:

```typescript
class BattleAnimator {
    // Physical dash attack
    dashAttack(attacker: Sprite, defender: Sprite, effectName?: string) {
        // 1. Attacker dashes to defender
        gsap.to(attacker, {
            x: defender.x, y: defender.y,
            duration: 0.4, ease: "ballisticUp"
        });
        
        // 2. Show impact effect
        if (effectName) this.showEffect(effectName, defender.pos);
        
        // 3. Return to position
        gsap.to(attacker, {
            x: attacker.startX, y: attacker.startY,
            duration: 0.4, ease: "ballisticDown", delay: 0.05
        });
        
        // 4. Defender recoil
        this.recoilShake(defender, 0.425);
    }
    
    // Projectile pattern
    projectile(from: Pos, to: Pos, sprite: string, onHit?: () => void) {
        const effect = this.showEffect(sprite, from);
        gsap.to(effect, {
            x: to.x, y: to.y,
            duration: 0.5, ease: "linear",
            onComplete: () => {
                this.explode(effect); // 3x scale + fade
                onHit?.();
            }
        });
    }
}
```

### Effect Sprite Migration Plan

**Phase 1 (Immediate):** Download missing high-priority sprites
```bash
# From Showdown's /fx/ folder (MIT licensed, see L8-29)
waterwisp.png
mudwisp.png
leftslash.png, rightslash.png
leftchop.png, rightchop.png
mistball.png
flareball.png
```

**Phase 2 (Short-term):** Physical attack effects
```bash
topbite.png, bottombite.png
rocks.png, rock1-3.png
poisoncaltrop.png
web.png
```

**Phase 3 (Long-term):** Polish & weather
- Stare, pointer, shine for status moves
- Weather overlays (when implementing weather)

### Implementation Strategy

1. **Start Small:** Pick 5 representative moves (1 physical, 1 special, 1 status, 1 multi-hit, 1 beam)
2. **Port Animations:** Translate their jQuery code to GSAP
3. **Test Timing:** Verify durations feel right (Showdown's 400ms dash = our ?)
4. **Iterate:** Adjust easing curves for our sprite system
5. **Scale Up:** Apply patterns to remaining ~200 moves

### Easing Curve Visualization Needed

**TODO:** Create side-by-side comparison:
- Showdown: ballisticUp vs jQuery's 'swing'
- GSAP: our quadInOut vs their quadUp
- Test with actual Pokemon sprites to validate feel

---

## 7. Licensing Notes

**From battle-animations.ts (L24-41):**
```
Most of this file is: CC0 (public domain)

This license DOES extend to all images in the fx/ folder, 
EXCEPT:
- icicle.png, lightning.png (CC-BY-SA-3.0)
- rocks.png, rock1-3.png (GPLv3)
```

**✅ Safe to use:** Most effect PNGs are CC0 (public domain)  
**⚠️ Attribution required:** icicle.png, lightning.png (credit Clint Bellanger)  
**⚠️ GPL contamination risk:** rocks.png (may require GPL if used)

**Recommendation:** Download all CC0 sprites, attribute CC-BY-SA ones, skip GPL rocks (create our own).

---

## 8. Example Move Ports

### Flamethrower (Showdown L16896+ → OpenMon)

**Showdown:**
```javascript
flamethrower: {
    anim(scene, [attacker, defender]) {
        scene.showEffect('fireball', {
            x: attacker.x,
            y: attacker.y,
            z: attacker.z,
            scale: 0.4,
            opacity: 0.6
        }, {
            x: defender.x,
            y: defender.y,
            z: defender.behind(20),
            scale: 0.6,
            opacity: 1,
            time: 500
        }, 'linear', 'explode');
    }
}
```

**OpenMon Equivalent:**
```typescript
flamethrower: {
    type: 'projectile',
    async anim(scene: BattleScene, attacker: Sprite, defender: Sprite) {
        const fireball = scene.createEffect('fireball', {
            x: attacker.x, y: attacker.y, z: attacker.z,
            scale: 0.4, opacity: 0.6
        });
        
        await gsap.to(fireball, {
            x: defender.x,
            y: defender.y - 20,
            scale: 0.6,
            opacity: 1,
            duration: 0.5,
            ease: "none"
        });
        
        // Explode: scale 3x and fade
        gsap.to(fireball, {
            scale: 1.8,
            opacity: 0,
            duration: 0.2,
            onComplete: () => fireball.remove()
        });
    }
}
```

### Tackle (Physical Dash)

**Showdown:**
```javascript
attacker.anim({x: defender.x, y: defender.y, z: defender.behind(5), time: 400}, 'ballistic');
attacker.anim({time: 500}, 'ballistic2Back');
defender.delay(425);
defender.anim({x: defender.x - 5, time: 75}, 'swing');
defender.anim({x: defender.x + 5, time: 100}, 'swing');
defender.anim({x: defender.x, time: 75}, 'swing');
```

**OpenMon:**
```typescript
tackle: {
    type: 'dash',
    async anim(scene: BattleScene, attacker: Sprite, defender: Sprite) {
        const tl = gsap.timeline();
        
        // Dash to target
        tl.to(attacker, {
            x: defender.x, y: defender.y,
            duration: 0.4, ease: "ballisticUp"
        });
        
        // Return
        tl.to(attacker, {
            x: attacker.startX, y: attacker.startY,
            duration: 0.5, ease: "ballisticDown"
        }, "-=0.1");
        
        // Defender recoil (delayed 425ms)
        tl.to(defender, {x: defender.x - 5, duration: 0.075, ease: "sine.inOut"}, 0.425);
        tl.to(defender, {x: defender.x + 5, duration: 0.1, ease: "sine.inOut"});
        tl.to(defender, {x: defender.x, duration: 0.075, ease: "sine.inOut"});
        
        await tl;
    }
}
```

---

## 9. Key Takeaways

### What to Copy
✅ **Easing functions** - Battle-tested physics curves  
✅ **Effect sprite library** - High-quality, CC0 assets  
✅ **Animation patterns** - Dash/projectile/status templates  
✅ **Timing conventions** - Proven durations (75ms shake, 400ms dash)  

### What to Adapt
🔧 **jQuery → GSAP** - More powerful, better performance  
🔧 **Position system** - Keep their 3D coords, adapt for GSAP  
🔧 **Sprite approach** - They use individual PNGs, we use sheets (keep ours)  

### What to Avoid
❌ **Direct code copy** - License incompatibility (AGPLv3 client vs our MIT)  
❌ **jQuery dependency** - Outdated, we have GSAP  
❌ **Over-complexity** - 38k lines for moves - start with core patterns  

---

## 10. Next Steps

1. **Download CC0 sprites** (waterwisp, mudwisp, slashes, etc.)
2. **Port 4 easing functions** to GSAP CustomEase
3. **Create animation helper class** with dash/projectile/status methods
4. **Test 5 representative moves** (Tackle, Flamethrower, Thunder Wave, Fury Swipes, Hyper Beam)
5. **Measure & tune timings** against Showdown for "feel"
6. **Scale to ~50 moves** covering main attack types
7. **Polish** with after-effects (screen shake, backgrounds)

---

**Analysis Complete.** All findings documented for implementation reference.
