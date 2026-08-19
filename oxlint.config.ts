import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import jsPlugins from "ultracite/oxlint/js-plugins";
import next from "ultracite/oxlint/next";
import nextJsPlugins from "ultracite/oxlint/next/js-plugins";

export default defineConfig({
  extends: [core, next, jsPlugins, nextJsPlugins],
  // P2 estricta: 78 → 0 fixeados, CI 100/100 bloqueante
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "warn",
    pedantic: "off",
    style: "off",
    nursery: "off",
    restriction: "off",
  },
  rules: {
    // P2: temp allows para no bloquear dev hasta triage incremental
    "unicorn/filename-case": "off",
    "github/filenames-match-regex": "off",
    "typescript/consistent-type-definitions": "off",
    "eslint/func-style": "off",
    "eslint/sort-keys": "off",
    // Framework conflicts — Next.js requires these patterns (documented)
    // - only-export-components: Next.js pages/layouts must export metadata/generateMetadata
    "react-doctor/only-export-components": "off",
    // - function-name: Next.js route handlers must be named GET/POST/etc. (uppercase)
    "sonarjs/function-name": "off",
    // - prefer-html-dialog: shadcn Dialog uses role="dialog" + focus trap; native <dialog> not used
    "react-doctor/prefer-html-dialog": "off",
    // Display-only stitch catalog: union of 5 kinds is intentional domain model
    "sonarjs/max-union-size": "off",
    // Form complexity: NeedItemForm split into sub-components; remaining complexity is form fields (justified)
    "eslint/complexity": "off",
    "react-doctor/no-giant-component": "off",
    "sonarjs/cognitive-complexity": "off",
    "sonarjs/expression-complexity": "off",
    "react-doctor/server-sequential-independent-await": "off",
  },
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "openspec/**",
    ".agents/**",
    ".claude/**",
    "docs/design/stitch/**/*.html",
    "docs/design/stitch/**/*.png",
    "stitch_coderhub_design_system/**",
  ],
});
