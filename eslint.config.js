import js from "@eslint/js"
import react from "eslint-plugin-react"
import stylistic from "@stylistic/eslint-plugin"
import globals from "globals"
import babelParser from "@babel/eslint-parser";

export default [
  js.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    semi: true,
    jsx: true,
  }),
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
    rules: {
      "no-await-in-loop": "off",
      "no-console": "off",
      "no-restricted-syntax": "off",
      "quotes": "off",
    }
  }
]
