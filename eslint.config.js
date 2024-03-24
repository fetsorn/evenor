import js from "@eslint/js"
import react from "eslint-plugin-react"
import globals from "globals"
import babelParser from "@babel/eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: babelParser,
    },
    plugins: {
      react,
    },
  },
  eslintConfigPrettier,
]
