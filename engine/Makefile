EMCC ?= emcc
OUT_DIR ?= ../web/public/wasm
OUT_JS ?= $(OUT_DIR)/seed_engine.js

CUBIOMES_SRC := $(wildcard cubiomes/*.c)
BINDINGS_SRC := $(wildcard src/*.c)

.PHONY: wasm clean

wasm: $(OUT_JS)

$(OUT_JS): $(BINDINGS_SRC) $(CUBIOMES_SRC)
	mkdir -p $(OUT_DIR)
	$(EMCC) $(BINDINGS_SRC) $(CUBIOMES_SRC) \
		-o $(OUT_JS) \
		-s WASM=1 \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s MODULARIZE=1 \
		-s EXPORT_NAME='SeedEngine' \
		-O3

clean:
	rm -f $(OUT_DIR)/seed_engine.js $(OUT_DIR)/seed_engine.wasm
