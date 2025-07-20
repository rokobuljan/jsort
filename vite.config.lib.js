// VITE CONFIG FOR LIBRARY

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import terser from '@rollup/plugin-terser';

const LIB_NAME = "jsort";

export default defineConfig({
    root: "./src/lib",
    base: "./",
    
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


        // lib: {
        //     entry: `${LIB_NAME}.js`,
        //     name: LIB_NAME,
        //     formats: ['es'],
        //     fileName: () => `${LIB_NAME}.js`
        // },
        // rollupOptions: {
        //     output: [
        //         {
        //             format: 'es',
        //             entryFileNames: `${LIB_NAME}.js`,
        //             minify: false
        //         },
        //         {
        //             format: 'es',
        //             entryFileNames: `${LIB_NAME}.min.js`,
        //             minify: 'terser'
        //         }
        //     ]
        // }
        // minify: "terser",
        // lib: {
        //     entry: `${LIB_NAME}.js`,
        //     name: LIB_NAME,
        //     fileName: LIB_NAME,
        //     minify: true,
        //     formats: ['es'],
        // },
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});