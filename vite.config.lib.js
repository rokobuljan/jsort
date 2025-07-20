// VITE CONFIG FOR LIBRARY

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIB_NAME = "jsort";

export default defineConfig({
    root: "./src/lib",
    base: "./",
    resolve: {
        alias: {
            '@lib': path.resolve(__dirname, `./src/lib/${LIB_NAME}.js`)
        }
    },
    build: {
        minify: "terser",
        lib: {
            entry: `${LIB_NAME}.js`,
            name: LIB_NAME,
            fileName: LIB_NAME,
            minify: true,
        },

        // rollupOptions: {
        //     output: {
        //         chunkFileNames: "layouts/[name].js",
        //         assetFileNames: `${LIB_NAME}.[ext]`, // Prevent renaming kioboard.css to style.css
        //     }
        // },
        // sourcemap: false,
        outDir: '../../dist',
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});