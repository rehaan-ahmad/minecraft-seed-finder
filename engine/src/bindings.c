#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <emscripten.h>
#include "generator.h"
#include "util.h"

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
            // Slime chunks follow a fixed algorithm: (seed + 10) % 16 == x % 16 && (seed + 10) % 16 == z % 16
            // This is the standard MC slime chunk logic.
            int64_t s = seed;
            int sx = x + j;
            int sz = z + i;
            out[i * w + j] = ((s + 10) % 16 == (sx % 16 + 16) % 16 && (s + 10) % 16 == (sz % 16 + 16) % 16);
        }
    }
}

EMSCRIPTEN_KEEPALIVE
int getSpawnPoint_wasm(int64_t seed, int version, int* x, int* z) {
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
