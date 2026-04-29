import { dirname, resolve } from "path";
import { env } from "process";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { webdriverio } from "@vitest/browser-webdriverio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            name: "evenor",
            fileName: "evenor",
        },
        sourcemap: "inline",
        minify: false,
        terserOptions: { compress: false, mangle: false },
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
