cmake_minimum_required(VERSION 3.20)

project(seed_engine C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

file(GLOB CUBIOMES_SOURCES CONFIGURE_DEPENDS cubiomes/*.c)
file(GLOB BINDING_SOURCES CONFIGURE_DEPENDS src/*.c)

add_library(seed_engine STATIC ${BINDING_SOURCES} ${CUBIOMES_SOURCES})
target_include_directories(seed_engine PRIVATE cubiomes src)
