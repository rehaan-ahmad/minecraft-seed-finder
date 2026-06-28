# 🌸 MINECRAFT SEED FINDER — TODO

> **Cherry Palette**
> `#1A0812` Night (BG) · `#2D1020` Dusk (Surface) · `#6B0F2A` Bark (Border)
> `#8B1A36` Deep (Accent Dark) · `#C5687B` Wood (Accent Mid) · `#FFB7C5` Pink (Primary)
> `#FF91A8` Highlight · `#F5D6DC` Mist (Text) · `#FF1493` Hot (CTA)
>
> **Typography**: Space Grotesk (headings) · Inter (body) · JetBrains Mono (coords/seeds)
>
> **Target**: Feature parity with seeds.gg · Java 1.0–1.21 + Bedrock 1.16–1.21 · Zero deployment cost

---

## ⚠️ ARCHITECTURE NOTE — READ FIRST

**DO NOT implement a Python/Celery/Redis backend.** Free tiers cannot sustain multi-million seed batch computation. Serverless functions timeout in <10s.

**Correct approach:** Cubiomes → Emscripten → `.wasm` → Web Workers → browser.
All computation runs client-side. Zero servers. Zero cost.

---

## PHASE 0 — MONOREPO SETUP

- [x] Install toolchain:
  ```bash
  sudo dnf install gcc gcc-c++ make cmake emscripten nodejs
  npm install -g pnpm
  ```
- [x] Clone Cubiomes:
  ```bash
  git clone https://github.com/Cubitect/cubiomes.git engine/cubiomes
  ```
- [x] Scaffold monorepo:
  ```
  seed-finder/
  ├── engine/              # C source + WASM build output
  │   ├── cubiomes/        # Cubiomes submodule
  │   ├── src/             # Custom bindings (bindings.c)
  │   ├── Makefile
  │   └── CMakeLists.txt
  ├── web/                 # Next.js app
  │   ├── app/
  │   ├── components/
  │   ├── workers/
  │   ├── lib/
  │   ├── data/
  │   └── public/
  │       ├── wasm/        # compiled .wasm + .js glue
  │       └── thumbnails/  # seed preview images
  ├── scripts/             # one-time seed DB generators (Python)
  │   └── .github/workflows/
  ```
- [x] `git init` + `.gitignore` (node_modules, `*.wasm`, `out/`, `.next/`)
- [x] Root `package.json` with pnpm workspace config

---

## PHASE 1 — CUBIOMES WASM ENGINE

### 1.1 C Bindings
- [x] Create `engine/src/bindings.c` exporting:
  ```c
  int    getBiomeAt(int64_t seed, int x, int z, int version);
  void   getBiomeRegion(int64_t seed, int x, int z, int w, int h, int version, int* out);
  void   findStructures(int64_t seed, int type, int radius, int version, int* out, int* count);
  void   findOres(int64_t seed, int x, int z, int y, int oreType, int version, int* out);
  void   getSlimeChunks(int64_t seed, int x, int z, int w, int h, int* out);
  int    getSpawnPoint(int64_t seed, int version, int* x, int* z);
  int    hashSeedString(const char* str);   // Java String.hashCode() for text seeds
  ```
- [x] Compile to WASM via Emscripten:
  ```bash
  emcc engine/src/bindings.c engine/cubiomes/*.c \
    -o web/public/wasm/seed_engine.js \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_getBiomeAt","_getBiomeRegion","_findStructures", \
       "_findOres","_getSlimeChunks","_getSpawnPoint","_hashSeedString"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='SeedEngine' \
    -O3
  ```
- [x] Output: `web/public/wasm/seed_engine.wasm` + `seed_engine.js`
- [x] Write `Makefile` with `make wasm` target
- [ ] Rebuild on any `engine/src/*.c` change in CI

### 1.2 Version Support Matrix
- [ ] Create `web/lib/versions.ts`:
  ```
  Java:    1.0, 1.2, 1.6, 1.7, 1.8, 1.9, 1.12, 1.13, 1.14, 1.15, 1.16,
           1.17, 1.18, 1.19, 1.20, 1.20.4, 1.21, 1.21.4
  Bedrock: 1.16, 1.17, 1.18, 1.19, 1.20, 1.21
  ```
- [ ] Gate version-specific features:
  - Pre-1.13: no Buried Treasure, no Shipwreck, no Phantom spawning
  - Pre-1.14: no Pillager Outpost, no Bamboo Jungle
  - Pre-1.16: no Bastion, no Nether generation overhaul
  - Pre-1.18: old terrain generation (build height 256, no deep dark)
  - Pre-1.19: no Ancient City, no Mangrove Swamp
  - Pre-1.20: no Cherry Grove, no Trail Ruins, no Sniffer
  - Pre-1.21: no Trial Chamber, no Copper Bulb
- [ ] Version enum maps to Cubiomes `MCVersion` constants
- [ ] Text seeds: pipe through `hashSeedString()` before use

### 1.3 Web Worker
- [ ] Create `web/workers/engine.worker.ts`
- [ ] Load WASM module inside worker (never on main thread)
- [ ] Message protocol:
  ```ts
  // Request
  { id: string, type: WorkerTaskType, payload: TaskPayload }

  // Response
  { id: string, type: 'result' | 'progress' | 'error', data: any, progress?: number }
  ```
- [ ] Supported task types:
  - `BIOME_REGION` — map tile render
  - `FIND_STRUCTURE` — locate nearest N instances
  - `FIND_ALL_STRUCTURES` — scan radius for all
  - `FIND_ORES` — ore density by chunk
  - `SLIME_CHUNKS` — boolean grid
  - `SPAWN_POINT` — get world spawn
  - `BATCH_SCAN` — seed search engine
- [ ] Task cancellation via `AbortController`
- [ ] Progress callbacks for long scans (emit every 1000 seeds)
- [ ] Worker pool: spawn `navigator.hardwareConcurrency` workers for parallel batch scans

---

## PHASE 2 — SEED MAP RENDERER

### 2.1 Biome Color Maps
- [ ] Create `web/data/biome-colors.ts`
- [ ] All Java biomes with hex RGB (1.7 palette + 1.18 cave biomes + 1.19 mangrove + 1.20 cherry)
- [ ] Cherry Grove biome: highlight `#FFB7C5` (cherry pink) with `#FF91A8` border
- [ ] Bedrock biome overrides where palette differs
- [ ] Nether biome palette (Crimson Forest, Warped Forest, Soul Sand Valley, etc.)
- [ ] End biome palette (End Highlands, End Midlands, Small End Islands)

### 2.2 Canvas Renderer (`web/lib/MapRenderer.ts`)
- [ ] OffscreenCanvas for background rendering per tile (512×512px = 32×32 chunks = 512×512 blocks)
- [ ] Tile coordinate system: `tileX = Math.floor(blockX / 512)`
- [ ] Progressive rendering: render center tile first, spiral outward
- [ ] Zoom levels: 1px = 4 blocks (default) to 1px = 64 blocks
- [ ] Pan: `pointermove` on drag, touch support
- [ ] Zoom: `wheel` + pinch-to-zoom
- [ ] Dimension switching: Overworld / Nether (1:8 scale) / End
- [ ] Block coordinate display on hover (`#F5D6DC` text, `#6B0F2A` bg pill)
- [ ] World spawn marker (cherry pink circle, white ring)
- [ ] Player position marker if seed was used with a real world save
- [ ] Grid overlay toggle (chunk grid, region grid)

### 2.3 Tile Cache (`web/lib/TileCache.ts`)
- [ ] LRU cache: max 512 rendered tile bitmaps in memory
- [ ] Cancel in-flight worker requests for tiles scrolled off-screen
- [ ] Preload 2-tile border around visible area
- [ ] Debounce tile requests: 50ms after pan stops

### 2.4 Structure Overlays
- [ ] SVG pin per structure type (unique icon, cherry-themed)
- [ ] Cluster pins at low zoom, expand at high zoom
- [ ] Click pin → coordinate chip + `/tp` command copy
- [ ] Hover pin → tooltip with structure name + biome

---

## PHASE 3 — STRUCTURE FINDERS

Implement every structure from seeds.gg. Per structure:
- `findNearest(seed, type, version, maxRadius)` → single nearest coord
- `findAll(seed, type, version, radius)` → array of all coords in radius
- Biome validation (structures only spawn in valid biomes — changes per version)
- Map overlay toggle

### Overworld
- [ ] Village (Plains, Desert, Savanna, Taiga, Snowy, Jungle — version-gated)
- [ ] Desert Temple
- [ ] Jungle Temple (Jungle only; absent in 1.21+ as "Jungle Pyramid")
- [ ] Witch Hut (Swamp only)
- [ ] Igloo (Snowy biomes only; basement with cleric varies)
- [ ] Ocean Monument (Deep Ocean variants)
- [ ] Woodland Mansion (Dark Forest only)
- [ ] Pillager Outpost (1.14+)
- [ ] Shipwreck (Ocean, Beach; 1.13+)
- [ ] Ocean Ruin (1.13+, stone vs coral variants)
- [ ] Ruined Portal (Overworld + Nether variants; 1.16+)
- [ ] Buried Treasure (Beach; 1.13+)
- [ ] Stronghold (3 per ring, multiple rings)
- [ ] Mineshaft (all underground; abandoned mineshaft variant in badlands)
- [ ] Dungeon (3-mob-spawner rooms)
- [ ] Ancient City (Deep Dark, Y=-52; 1.19+)
- [ ] Trail Ruins (1.20+; jungle, taiga, snowy taiga, old growth)
- [ ] Trial Chamber (1.21+; all underground biomes)
- [ ] Amethyst Geode (1.17+)
- [ ] Slime Chunks (algorithmic — seed-based, no Cubiomes needed)
- [ ] Fossil (Desert/Swamp underground; 1.10+)
- [ ] Desert Well
- [ ] Mooshroom Island (biome finder, not structure)

### Nether
- [ ] Nether Fortress (all Nether biomes)
- [ ] Bastion Remnant (not in Nether Wastes; 1.16+)
- [ ] Ruined Portal — Nether variant (1.16+)
- [ ] Nether Fossil (1.16+; Soul Sand Valley)

### End
- [ ] End City (End Highlands; 1.9+)
- [ ] End Gateway (ring around main island; 1.9+)

### Ore-adjacent
- [ ] Geode finder → Amethyst (see Ores section)

---

## PHASE 4 — ORE FINDERS

Per ore: density heatmap overlay on map at selected Y-level.

- [ ] **Diamond** — optimal Y: -58 to -59. Reduced exposed veins in 1.18+
- [ ] **Iron** — bimodal: Y:15 (surface) + Y:232 (mountains). Added in 1.18
- [ ] **Gold** — optimal Y: -16. Bonus in Badlands: Y:32 to Y:256
- [ ] **Copper** — optimal Y: 48. Large blobs. 1.17+
- [ ] **Emerald** — Mountains/Windswept biomes only. Y:-16 to Y:320. 1.18 changed distribution
- [ ] **Lapis Lazuli** — uniform below Y:0. Rare blobs to Y:64
- [ ] **Redstone** — optimal Y: -58 to -59. Same as Diamond
- [ ] **Coal** — Y:96 primary (mountains to Y:192). Abundant surface exposure
- [ ] **Ancient Debris** — Nether only. Y:15 (2 blobs) + Y:22 (rare). 1.16+

Per ore implementation:
- [ ] Y-level probability chart (bar chart, cherry colors)
- [ ] "Best Y-level" tooltip with numeric recommendation
- [ ] Heatmap mode: chunk-level ore density overlay (green → cherry gradient)
- [ ] Version-aware: 1.18 completely reworked ore distribution — all values differ

---

## PHASE 5 — SEED DATABASE

### 5.1 Generation Script (`scripts/generate_seed_db.py`)
- [ ] Runs locally once to produce static JSON, never in production
- [ ] Uses `ctypes` to call compiled Cubiomes binary (not WASM)
- [ ] Scans range of seeds, scores each:
  ```
  score += (structures within 200 blocks of spawn) * 20
  score += (structure combo multipliers) * 50
  score += (rare biome at spawn) * 30
  score += (spawn on island) * 40
  ```
- [ ] Combo bonuses: Quad Witch Hut +200, Double Mansion +150, Triple Village +100
- [ ] Export `web/public/data/rare_seeds.json` (~88k entries, gzip compressed)

### 5.2 JSON Schema
```json
{
  "seed": -376302731,
  "version": "1.21",
  "edition": "java",
  "score": 175,
  "tags": ["quad-village", "double-temple", "multi-structure"],
  "structures": [
    { "type": "village", "x": 48, "z": 192, "variant": "plains" },
    { "type": "desert_temple", "x": -144, "z": 80 }
  ],
  "thumbnail": "https://r2.yourdomain.com/thumbnails/-376302731.webp",
  "spawnsIn": "Desert",
  "spawnX": 0,
  "spawnZ": 0
}
```

### 5.3 Thumbnail Pipeline (`scripts/generate_thumbnails.py`)
- [ ] For each seed in DB: call Cubiomes → render 200×200 biome map → save `.webp`
- [ ] Cherry Grove seeds: pink-heavy thumbnails will stand out — no special casing needed
- [ ] Upload batch to Cloudflare R2 via `wrangler r2 object put`
- [ ] Target: <50KB per thumbnail (200×200 webp at quality 60)

### 5.4 Seed Categories (59 total, matching seeds.gg)

**Structures:**
- [ ] Village Seeds · Survival Island · Mansion Seeds · Ancient City
- [ ] Desert Temple · Ocean Monument · Trial Chamber · Pillager Outpost
- [ ] Stronghold · Jungle Temple · Igloo · Shipwreck · Witch Hut

**Combos:**
- [ ] Double Village · Triple Village · Quad Village
- [ ] Quad Witch Hut · Double Mansion · Double Ancient City
- [ ] Multi-Structure Spawn · Spawn on Island · Island Spawn + Village

**Biomes:**
- [ ] Cherry Grove Spawn · Mushroom Island · Ice Spike Island
- [ ] Bamboo Jungle Spawn · Mangrove Swamp Spawn · Badlands Spawn
- [ ] Snowy Slopes Spawn · Jagged Peaks · Deep Dark Surface Access
- [ ] All 6 Forest Types at Spawn

**Rare/Special:**
- [ ] Spawn at Stronghold · Village in Deep Dark · Buried Temple Combo
- [ ] Trial + Ancient City Nearby · Monument at Spawn · Mansion at Spawn

---

## PHASE 6 — SEED SEARCH ENGINE

- [ ] Multi-parameter search form:
  - Seed number (exact) OR seed range (min–max)
  - Minecraft version + edition
  - Required structures (multi-select checkboxes, all 30+ types)
  - Max distance from spawn per structure (slider, 0–2000 blocks)
  - Required biome at spawn (dropdown)
  - Minimum score threshold
  - Tags filter (multi-select)
- [ ] Search modes:
  - **Database Search**: filter `rare_seeds.json` instantly (client-side JSON filter)
  - **Live Scan**: Web Worker pool scans arbitrary seed range in real-time
- [ ] Live scan:
  - Spawn `hardwareConcurrency` workers
  - Partition seed range evenly across workers
  - Aggregate results, sort by score
  - Progress bar: `seeds_scanned / total_range` per worker
  - Pause / Resume / Cancel buttons
  - ETA display
- [ ] Results:
  - Grid of `SeedCard` components (lazy-loaded thumbnails)
  - Sort by: Score (default), Structures Count, Distance
  - Export: JSON · CSV · Copy seed list
  - Share URL: all params serialized in `#hash`
- [ ] Rate limit UX: warn if scan range >10M seeds (>30s estimated)

---

## PHASE 7 — NEXT.JS FRONTEND

### 7.1 Project Init
```bash
cd web
npx create-next-app@latest . --typescript --tailwind --app --src-dir
pnpm add zustand @radix-ui/react-slider @radix-ui/react-select
pnpm add @radix-ui/react-checkbox @radix-ui/react-tabs @radix-ui/react-tooltip
pnpm add framer-motion lucide-react next-themes
```

### 7.2 Tailwind Cherry Config (`tailwind.config.ts`)
```ts
colors: {
  cherry: {
    night:     '#1A0812',  // bg-cherry-night
    dusk:      '#2D1020',  // bg-cherry-dusk (cards)
    bark:      '#6B0F2A',  // border-cherry-bark
    deep:      '#8B1A36',  // text accents
    wood:      '#C5687B',  // secondary UI
    pink:      '#FFB7C5',  // primary buttons, highlights
    hot:       '#FF1493',  // CTA, hover states
    highlight: '#FF91A8',  // hover, active
    mist:      '#F5D6DC',  // body text
  }
},
fontFamily: {
  display: ['Space Grotesk', 'sans-serif'],
  body:    ['Inter', 'sans-serif'],
  mono:    ['JetBrains Mono', 'monospace'],
},
```

### 7.3 Global Layout (`app/layout.tsx`)
- [ ] `bg-cherry-night text-cherry-mist` root
- [ ] Import Space Grotesk, Inter, JetBrains Mono from Google Fonts
- [ ] Top header: fixed, `bg-cherry-dusk/80 backdrop-blur`
  - Logo: cherry blossom icon + "SEED FINDER" in Space Grotesk
  - Global seed input (compact)
  - Version selector
  - Edition toggle (Java / Bedrock)
  - Sign In button (top-right, future auth)
- [ ] Bottom nav tabs: Map · Structures · Ores · Seeds · Categories · Search

### 7.4 Pages

#### `/` — Landing
- [ ] Hero: full-height, seed input centered
  - Large `SeedInput` component (auto-focus)
  - Version + Edition selectors inline
  - "VIEW SEED MAP" button (cherry pink bg, hot hover)
  - "RANDOM" button (bark bg)
  - "SEED SEARCH ENGINE" link below
- [ ] Background: subtle animated cherry blossom particle canvas (CSS only, no heavy lib)
- [ ] Below fold: Structure Finders grid
- [ ] Below: Ore Finders row
- [ ] Below: Rarest Seeds gallery (top 8)
- [ ] Below: Seed Categories grid (all 59)
- [ ] Below: FAQ accordion

#### `/map` — Interactive Map
- [ ] Full-viewport canvas map
- [ ] Left sidebar (collapsible, `bg-cherry-dusk`):
  - Structure toggles (checkbox + color dot per type)
  - Ore overlay selector
  - Dimension tabs (Overworld / Nether / End)
  - Chunk grid toggle
  - Search this area button
- [ ] Bottom bar: current seed, version, coordinates, zoom level
- [ ] Zoom controls (+ / − buttons, cherry pink)
- [ ] Share button → copy URL with `?seed=X&v=1.21&e=java`
- [ ] Biome legend (expandable panel, bottom-right)

#### `/structures/[type]` — Structure Detail
- [ ] Structure icon (large, cherry-framed)
- [ ] "Nearest to spawn" card (coord + biome + `/tp` command)
- [ ] All found in radius list (table: Type, X, Z, Distance, Biome)
- [ ] Map with pins auto-loaded
- [ ] Version-specific notes (when structure was added, biome requirements)

#### `/ores/[type]` — Ore Detail
- [ ] Y-level distribution chart (bar chart, cherry gradient)
- [ ] Optimal Y highlight (cherry pink bar)
- [ ] Biome restrictions note (Emerald, Gold badlands bonus)
- [ ] Map heatmap overlay auto-loaded

#### `/seeds` — Rarest Seeds Gallery
- [ ] Filter bar: version, edition, tags, min score
- [ ] Sort: Score · Date Added · Alphabetical
- [ ] Card grid: thumbnail + score badge + seed number + tags + "Spawns in" label
- [ ] Infinite scroll (virtual list for performance)
- [ ] Click card → navigate to `/map?seed=X`

#### `/categories` — Seed Categories
- [ ] 59 cards in responsive grid
- [ ] Category icon + name + seed count badge
- [ ] Section grouping: Structures / Combos / Biomes / Rare
- [ ] Click → filtered seeds list

#### `/search` — Seed Search Engine
- [ ] Left panel: all filter controls
- [ ] Right panel: results grid or progress
- [ ] Progress: worker count · seeds/sec · ETA · found count
- [ ] Empty state: cherry blossom illustration + "No seeds match yet"

### 7.5 Shared Components

- [ ] `SeedInput` — validates int64 range, accepts text (hashes it), placeholder cherry-styled
- [ ] `VersionSelector` — grouped dropdown (Java / Bedrock, all versions)
- [ ] `EditionToggle` — pill toggle Java | Bedrock
- [ ] `DimensionTabs` — Overworld | Nether | End icon tabs
- [ ] `StructureIcon` — SVG per structure type (cherry-tinted on hover)
- [ ] `OreIcon` — item sprite or SVG per ore type
- [ ] `SeedCard` — thumbnail + score + tags + seed number
- [ ] `CoordChip` — `X: 48, Z: 192` styled chip (JetBrains Mono)
- [ ] `TpCommand` — `/tp @s 48 64 192` with copy button
- [ ] `ProgressBar` — animated cherry pink fill
- [ ] `BiomeLegend` — color swatch grid
- [ ] `MapCanvas` — wraps OffscreenCanvas renderer
- [ ] `StructurePin` — SVG map overlay pin
- [ ] `SearchForm` — full search parameter form

### 7.6 State Management (Zustand)

- [ ] `useSeedStore`:
  ```ts
  { seed, version, edition, dimension,
    setSeed, setVersion, setEdition, setDimension }
  ```
- [ ] `useMapStore`:
  ```ts
  { panX, panY, zoom, activeLayers, tileCache,
    setPan, setZoom, toggleLayer }
  ```
- [ ] `useWorkerStore`:
  ```ts
  { workers: Worker[], taskQueue, activeTask,
    dispatch, cancel }
  ```
- [ ] `useSearchStore`:
  ```ts
  { params, results, progress, status,
    setParams, startSearch, pauseSearch, cancelSearch }
  ```

### 7.7 WASM Integration (`web/lib/WasmLoader.ts`)
- [ ] Load `seed_engine.js` via `<script>` in `_document.tsx`
- [ ] Initialize WASM module once on app load
- [ ] Pass module reference to worker pool on init
- [ ] Handle WASM load failure gracefully (error banner, no crash)

---

## PHASE 8 — LOCAL QA

- [ ] `pnpm dev` → `localhost:3000` full GUI
- [ ] Validate against seeds.gg for seed `-376302731`:
  - Quad village within 193 blocks ✓
  - Spawns in Desert ✓
  - Score ~175 ✓
- [ ] Test version matrix:
  - Java 1.7 (old terrain, no Stronghold ring logic)
  - Java 1.13 (aquatic update structures)
  - Java 1.16 (nether overhaul)
  - Java 1.18 (terrain overhaul, new ore distribution)
  - Java 1.21 (Trial Chambers)
  - Bedrock 1.20, 1.21
- [ ] Performance targets:
  - 512×512 biome tile render: <100ms
  - 4096×4096 full scan: <3s (with worker pool)
  - Pan/zoom: 60fps, no jank
  - Seed search 1M range: <5s on 8-core
- [ ] Edge cases:
  - Seed `0`, `2147483647`, `-2147483648`
  - Text seed `"Herobrine"` → hash → display numeric result
  - Empty string seed → use `0`
  - Invalid input → inline error, no crash
- [ ] Browser targets: Chrome 120+, Firefox 120+, Safari 17+
- [ ] Mobile: responsive at 375px, touch pan/zoom works
- [ ] SharedArrayBuffer availability check + fallback warning banner

---

## PHASE 9 — ZERO-COST DEPLOYMENT

### Stack

| Service | Purpose | Cost |
|---------|---------|------|
| Cloudflare Pages | Static Next.js hosting | Free (500 builds/month) |
| Cloudflare R2 | Seed thumbnails CDN | Free (10GB storage, 10M reads) |
| GitHub | Source repo | Free |
| GitHub Actions | Build + deploy | Free (2000 min/month) |

**Total monthly cost: $0.00**

### Next.js Static Export Config
```js
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },  // R2 handles images
  webpack(config) {
    config.experiments = { asyncWebAssembly: true };
    return config;
  }
}
```

### Cloudflare Pages Config
- [ ] Create `wrangler.toml`
- [ ] Set COOP/COEP headers in `_headers` file (required for SharedArrayBuffer):
  ```
  /*
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp
  ```
- [ ] Connect GitHub repo to Cloudflare Pages dashboard
- [ ] Build command: `make wasm && pnpm build`
- [ ] Output dir: `out/`

### CI/CD (`.github/workflows/deploy.yml`)
- [ ] Trigger: push to `main`
- [ ] Steps:
  1. Install Emscripten
  2. `make wasm` (build C → WASM)
  3. `pnpm install`
  4. `pnpm build` (Next.js static export)
  5. Deploy `out/` to Cloudflare Pages via Wrangler
- [ ] Cache: Emscripten cache + node_modules between runs

### R2 Thumbnail Setup
- [ ] Create R2 bucket `seed-thumbnails`
- [ ] Enable public access
- [ ] Run `scripts/generate_thumbnails.py` locally
- [ ] Upload: `wrangler r2 object put seed-thumbnails --file thumbnails/`
- [ ] Update `rare_seeds.json` thumbnail URLs to R2 public domain

### Custom Domain (Optional, Free)
- [ ] Add custom domain in Cloudflare Pages dashboard
- [ ] DNS automatically configured (Cloudflare manages DNS)

---

## DESIGN SYSTEM REFERENCE

### Spacing
- Base unit: 4px
- Component padding: 12px / 16px / 24px
- Section gaps: 48px / 64px / 96px

### Border Radius
- Cards: 8px
- Buttons: 6px
- Chips/pills: 999px (full round)
- Map container: 0px (edge-to-edge)

### Shadows
- Card: `0 0 0 1px #6B0F2A, 0 4px 24px #1A081280`
- Pin overlay: `0 2px 8px #1A081299`
- Active/focus: `0 0 0 2px #FFB7C5`

### Animation
- Map tile fade-in: 150ms ease
- Panel slide: 200ms ease-out
- Hover transitions: 100ms
- Progress fill: linear, no easing
- NO decorative loading animations in tool/data components

### Icons
- Structure icons: 24×24 SVG, filled cherry-dusk bg, cherry-pink stroke
- Ore icons: Minecraft item sprites (16×16, scaled to 24×24 with pixel rendering)
- Nav icons: Lucide React, 20px, `stroke-cherry-mist`

---

## KNOWN RISKS

| Risk | Mitigation |
|------|-----------|
| SharedArrayBuffer blocked (older browsers) | Single-threaded fallback worker mode |
| WASM init time >1s on slow devices | Show spinner, defer non-critical features |
| Cubiomes accuracy vs actual game | Note: biome maps accurate, structure positions ±4 blocks |
| 88k seed DB JSON too large | Gzip compression (typically 3-4MB → 400KB) |
| Cloudflare free tier limits | 500 builds/month + 100k req/day far exceeds typical usage |
| Text seed hash collisions | Intentional (Java behavior) — document it |

---

## VERIFICATION SEEDS (cross-check against seeds.gg)

| Seed | Version | Expected | Category |
|------|---------|----------|----------|
| `-376302731` | Java 1.21 | Quad Village + 2 Desert Temple | Multi-Structure |
| `7019209048` | Java 1.21 | 4 Jungle Temples w/in 202 blocks | Jungle |
| `-3010209706` | Java 1.21 | Triple Ancient City, Cherry Grove | Cherry Grove |
| `732163391` | Java 1.21 | 3 Desert Temples + 2 Villages | Desert |
| `1569006433` | Java 1.21 | 2 Woodland Mansions near spawn | Double Mansion |
| `1163926824` | Java 1.21 | Survival island, 3 Desert Temples | Island Spawn |

---

*All phases must complete before deployment. Phases 0–8 are local-only.*
*Do not skip Phase 0 architecture decision — it invalidates the rest if wrong.*
