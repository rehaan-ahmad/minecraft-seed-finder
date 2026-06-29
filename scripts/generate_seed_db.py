import os
import ctypes
import json
import gzip
from typing import List, Dict, Any

# Load the compiled Cubiomes shared library
# Assumes we compile it to a .so for the generator script
LIB_PATH = "engine/libcubiomes.so"

class CubiomesWrapper:
    def __init__(self):
        self.lib = ctypes.CDLL(LIB_PATH)
        self._setup_functions()

    def _setup_functions(self):
        # Define the C functions from bindings.c/cubiomes.h
        self.lib.getBiomeAt_wasm.argtypes = [ctypes.c_longlong, ctypes.c_int, ctypes.c_int, ctypes.c_int]
        self.lib.getBiomeAt_wasm.restype = ctypes.c_int
        # Add other needed functions...

    def get_biome(self, seed: int, x: int, z: int, version: int):
        return self.lib.getBiomeAt_wasm(seed, x, z, version)

def score_seed(wrapper: CubiomesWrapper, seed: int, version: int) -> float:
    score = 0.0
    # 1. Check spawn biome (Example: Cherry Grove = 120)
    spawn_biome = wrapper.get_biome(seed, 0, 0, version)
    if spawn_biome == 120:
        score += 30
    
    # 2. Simple logic for structures within 200 blocks
    # (This is a placeholder until we integrate full finder logic in C)
    # score += (structures_count * 20)
    
    return score

def generate_database(seed_range: range, version: int):
    wrapper = CubiomesWrapper()
    db = []
    
    for seed in seed_range:
        score = score_seed(wrapper, seed, version)
        if score > 0:
            db.append({
                "seed": seed,
                "version": str(version),
                "edition": "java",
                "score": score,
                "tags": ["rare-biome"] if score >= 30 else [],
                "structures": [],
                "thumbnail": f"https://archive.org/download/minecraft-seed-finder/thumb_{seed}.webp",
                "spawnsIn": "Unknown",
                "spawnX": 0,
                "spawnZ": 0
            })
    
    # Save as compressed JSON
    with gzip.open("web/public/data/rare_seeds.json.gz", "wt", encoding="utf-8") as f:
        json.dump(db, f)

if __name__ == "__main__":
    # Scan a sample range for demonstration
    generate_database(range(-1000000, 1000000), 121)
