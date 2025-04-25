import js from "@eslint/js";
import solid from "eslint-plugin-solid";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: babelParser,
    },
    plugins: {
      solid,
    },
  },
  eslintConfigPrettier,
];
