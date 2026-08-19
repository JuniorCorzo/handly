import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  sortTailwindcss: {
    functions: ["clsx", "cva", "tw", "twMerge", "cn", "twJoin", "tv"],
    stylesheet: "./src/styles/globals.css",
  },
  ignorePatterns: [
    "openspec/**",
    ".agents/**",
    ".claude/**",
    "docs/design/stitch/**",
    "stitch_coderhub_design_system/**",
    "node_modules/**",
    ".next/**",
  ],
});
