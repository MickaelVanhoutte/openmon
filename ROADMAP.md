# OpenMon Roadmap

## Phase 1: Technical Fixes & Implementation Completion (Current)

Branch: `fix/phase1-technical-debt`

### Architecture & Performance
1. Fix DEBUG flag — replace hardcoded `true` with `import.meta.env.DEV`
2. Optimize Pokedex data loading — `Map<number, PokedexEntry>` for O(1) lookups, lazy loading
3. Fix Audio memory leak — unload Howl instances on map change
4. Harden save system — IndexedDB, factory deserialization, export/import
5. Decouple PokemonInstance from PokedexEntry — composition over inheritance
6. Extract GameContext (1,220 LOC) into focused services
7. Replace setTimeout chains (16+) with async/await patterns
8. Replace setInterval polling with Svelte 5 reactivity

### Complete Existing Implementations
9. Improve Battle AI — threat-scoring, personalities, boss minimax
10. Complete held item effects — top 20 competitive items
11. Add Move Relearner / TM system
12. Activate trainer class system (13 classes already designed)
13. Implement unfinished ability stubs in tier6-complex.ts

### Infrastructure
14. Move build artifacts (dist/, docs/) out of git
15. Increase test coverage (target: 60% statements, 35% branches)

---

## Phase 2: Community & Endgame (Future)

- Community dungeon seed sharing + leaderboards
- Battle Tower / competitive mode
- Achievement system (extend MetaProgress)
- 3D HM field effects in dungeons (Rock Smash, Surf, Cut)
- Web Worker dungeon pre-generation
- Save export/import via Web Share API

---

## Phase 3: Content Expansion (Future)

- Breeding / Egg system at dungeon rest floors
- Day/Night cycle with time-based evolutions and encounters
- Mega Evolution system
- Combo Move system expansion (Combo Dex)
- WebRTC peer-to-peer PvP battles

---

## Phase 4: Polish & Innovation (Future)

- Local play analytics dashboard (Chart.js)
- AI-powered NPC dialog at rest floors
- Procedural biome blending on transition floors
- Cloud save sync (Supabase/Firebase)
