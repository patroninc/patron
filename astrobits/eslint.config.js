import eslintPluginAstro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  globalIgnores(["dist", "node_modules", ".astro"]),
  {
    rules: {},
  },
]);
