import nextConfig from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = [
  ...nextConfig,
  eslintConfigPrettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "no-unused-vars": "warn",
      "no-console": "warn",
    },
  },
];

export default eslintConfig;
