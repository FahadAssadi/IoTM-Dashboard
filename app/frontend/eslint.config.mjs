import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsonPlugin from "eslint-plugin-json"; // ✅ use ESM import instead of require()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.json"],
    plugins: {
      json: jsonPlugin,
    },
    rules: {
      // add JSON-specific rules here if needed
    },
  },
];

export default eslintConfig;
