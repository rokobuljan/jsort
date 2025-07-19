import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";

export default defineConfig({
    root: "src/docs",
    base: "./",

    build: {
        minify: "terser",
        // sourcemap: false,
        outDir: '../../docs', // Output to a sibling directory
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});