// VITE CONFIG FOR LIBRARY

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";

const LIB_NAME = "jsort";

export default defineConfig({
    root: "./src/lib",
    base: "./",
    build: {
        minify: "terser",
        lib: {
            entry: `${LIB_NAME}.js`,
            name: LIB_NAME,
            fileName: LIB_NAME,
            minify: true,
        },
        outDir: '../../dist',
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});