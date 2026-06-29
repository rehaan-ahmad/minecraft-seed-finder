#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include "generator.h"
#include "util.h"
#include "finders.h"

EMSCRIPTEN_KEEPALIVE
int getBiomeAt_wasm(int64_t seed, int x, int z, int version) {
    Generator g;
    setupGenerator(&g, version, 0);
    applySeed(&g, 0, seed);
    return getBiomeAt(&g, 1, x, 0, z);
}

EMSCRIPTEN_KEEPALIVE
void getBiomeRegion_wasm(int64_t seed, int x, int z, int w, int h, int version, int* out) {
    Generator g;
    setupGenerator(&g, version, 0);
    applySeed(&g, 0, seed);
    for (int i = 0; i < h; i++) {
        for (int j = 0; j < w; j++) {
            out[i * w + j] = getBiomeAt(&g, 1, x + j, 0, z + i);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
void findStructures_wasm(int64_t seed, int type, int radius, int version, int* out, int* count) {
    // Implementation based on Cubiomes finders.h
    // In a real scenario, we'd use the specific Cubiomes structure finders.
    // Since the full Cubiomes API requires complex setup per structure,
    // we implement a generic interface that can be expanded.
    
    // Mocking the logic: return 0 found for now, 
    // but the glue is now ready for specific finder calls.
    *count = 0;
}

EMSCRIPTEN_KEEPALIVE
void findOres_wasm(int64_t seed, int x, int z, int y, int oreType, int version, int* out) {
    out[0] = 0;
}

EMSCRIPTEN_KEEPALIVE
void getSlimeChunks_wasm(int64_t seed, int x, int z, int w, int h, int* out) {
    for (int i = 0; i < h; i++) {
        for (int j = 0; j < w; j++) {
            int64_t s = seed;
            int sx = x + j;
            int sz = z + i;
            out[i * w + j] = ((s + 10) % 16 == (sx % 16 + 16) % 16 && (s + 10) % 16 == (sz % 16 + 16) % 16);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
int getSpawnPoint_wasm(int64_t seed, int version, int* x, int* z) {
    // Cubiomes setup for spawn point retrieval
    Generator g;
    setupGenerator(&g, version, 0);
    applySeed(&g, 0, seed);
    
    // Mocking actual spawn retrieval logic from Cubiomes internals
    *x = 0;
    *z = 0;
    return 0; 
}

EMSCRIPTEN_KEEPALIVE
int hashSeedString_wasm(const char* str) {
    int h = 0;
    while (*str) {
        h = 31 * h + *(str++);
    }
    return h;
}
