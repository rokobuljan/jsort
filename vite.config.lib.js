// VITE CONFIG FOR LIBRARY

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import terser from '@rollup/plugin-terser';
import packageJson from './package.json'

const LIB_NAME = "jsort";

export default defineConfig({
    root: "./src/lib",
    base: "./",
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version)
    },
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
        lib: {
            entry: `${LIB_NAME}.js`,
        },
        minify: "terser",
        rollupOptions: {
            output: [
                // Unminified version
                {
                    format: 'es',
                    entryFileNames: `${LIB_NAME}.js`,
                },
                // Minified version  
                {
                    format: 'es',
                    entryFileNames: `${LIB_NAME}.min.js`,
                    plugins: [terser()],
                }
            ]
        }
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});