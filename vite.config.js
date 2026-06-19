import { dirname, resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync } from "fs";
import { env } from "process";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { webdriverio } from "@vitest/browser-webdriverio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function defaultMindPlugin() {
    const virtualModuleId = "virtual:default-mind-files";
    const resolvedId = "\0" + virtualModuleId;

    return {
        name: "default-mind",
        resolveId(id) {
            if (id === virtualModuleId) return resolvedId;
        },
        load(id) {
            if (id !== resolvedId) return;

            const mindDir = resolve(__dirname, "src/default_mind");
            const files = {};

            function walk(dir, prefix) {
                for (const entry of readdirSync(dir)) {
                    const full = resolve(dir, entry);
                    if (statSync(full).isDirectory()) {
                        walk(full, prefix + entry + "/");
                    } else {
                        files[prefix + entry] = readFileSync(full, "utf8");
                    }
                }
            }

            walk(mindDir, "");

            return `export default ${JSON.stringify(files)};`;
        },
    };
}

function copyMindbookCss() {
    return {
        name: "copy-mindbook-css",
        writeBundle() {
            const src = resolve(__dirname, "node_modules/@fetsorn/mindbook/dist/mindbook.css");
            const dest = resolve(__dirname, "dist/mindbook.css");
            copyFileSync(src, dest);
        },
    };
}

export default defineConfig({
    plugins: [defaultMindPlugin(), copyMindbookCss()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            name: "evenor",
            fileName: "evenor",
        },
        sourcemap: "inline",
        minify: false,
        terserOptions: { compress: false, mangle: false },
        rollupOptions: {
            output: {
                codeSplitting: false,
            },
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src/"),
            path: "path-browserify",
        },
    },
    define: {
        "process.env.NODE_ENV": '"production"',
    },
    test: {
        include: ["./src/test/*.test.js"],
        setupFiles: ["./src/test/setup.js"],
        coverage: {
            provider: "istanbul",
            coverage: {
                reporter: ["text", "json", "html"],
            },
        },
        browser: {
            provider: webdriverio(),
            enabled: true,
            instances: [
                {
                    browser: "firefox",
                },
            ],
        },
    },
});
