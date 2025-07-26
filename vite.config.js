// VITE CONFIG FOR DOCS

import { defineConfig } from "vite";
import postcssNesting from "postcss-nesting";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from './package.json'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIB_NAME = "jsort";

export default defineConfig({
    root: "src/docs",
    base: "./",
    resolve: {
        alias: {
            '@lib': path.resolve(__dirname, `./src/lib/${LIB_NAME}.js`)
        }
    },
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version)
    },
    build: {
        minify: "terser",
        // sourcemap: false,
        outDir: '../../docs',
        emptyOutDir: true,
    },
    css: {
        postcss: {
            plugins: [postcssNesting()],
        }
    },
});