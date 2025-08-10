// VITE CONFIG FOR LIBRARY

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import terser from "@rollup/plugin-terser";
import dts from "vite-plugin-dts"
import packageJson from "./package.json"

const LIB_NAME = "jsort";

export default defineConfig({
    root: "./src/lib",
    base: "./",
    plugins: [
        {
            name: "replace-version",
            transform(code, id) {
                if (id.includes("jsort.js")) {
                    return code.replace("__APP_VERSION__", packageJson.version)
                }
            }
        },
        dts()
    ],
    build: {
        outDir: "../../dist",
        emptyOutDir: true,
        lib: {
            entry: `${LIB_NAME}.js`,
        },
        minify: "terser",
        rollupOptions: {
            output: [
                // Unminified version
                {
                    format: "es",
                    entryFileNames: `${LIB_NAME}.js`,
                },
                // Minified version  
                {
                    format: "es",
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