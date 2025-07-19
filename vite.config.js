import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";

const LIBRARYNAME = "jsort";

export default defineConfig({
    root: "./src",
    base: "./",
    build: {
        minify: "terser",
        lib: {
            entry: `jsort.js`,
            name: "jsort",
            fileName: "jsort",
            minify: true,
        },
        // rollupOptions: {
        //     output: {
        //         chunkFileNames: "layouts/[name].js",
        //         assetFileNames: `${LIBRARYNAME}.[ext]`, // Prevent renaming kioboard.css to style.css
        //     }
        // },
        // sourcemap: false,
        outDir: '../dist', // Output to a sibling directory
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});