CC = emcc
CFLAGS = -O3 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s EXPORT_NAME='SeedEngine'
CUBIOMES_DIR = cubiomes
SRC = src/bindings.c $(CUBIOMES_DIR)/*.c

EXPORTED_FUNCTIONS = _getBiomeAt_wasm,_getBiomeRegion_wasm,_findStructures_wasm,_findOres_wasm,_getSlimeChunks_wasm,_getSpawnPoint_wasm,_hashSeedString_wasm

wasm:
	mkdir -p web/public/wasm
	$(CC) $(CFLAGS) $(SRC) -o web/public/wasm/seed_engine.js \
		-s EXPORTED_FUNCTIONS='[$(EXPORTED_FUNCTIONS)]' \
		-I$(CUBIOMES_DIR)

clean:
	rm -rf web/public/wasm/seed_engine.*
