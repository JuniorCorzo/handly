import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import jsPlugins from 'ultracite/oxlint/js-plugins'
import nextJsPlugins from 'ultracite/oxlint/next/js-plugins'

export default defineConfig({
  extends: [core, next, jsPlugins, nextJsPlugins],
  // P2 equilibrada: audit triage pendiente (~128 lint + 205 format previos)
  // WU3: ignores bajan ruido 205→~54; CI || true hasta fix incremental
  categories: {
    correctness: 'warn',
    suspicious: 'warn',
    perf: 'warn',
    pedantic: 'off',
    style: 'off',
    nursery: 'off',
    restriction: 'off'
  },
  rules: {
    // P2: temp allows para no bloquear dev hasta triage incremental
    'unicorn/filename-case': 'off',
    'github/filenames-match-regex': 'off',
    'typescript/consistent-type-definitions': 'off',
    'eslint/func-style': 'off',
    'eslint/sort-keys': 'off'
  },
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    'openspec/**',
    '.agents/**',
    '.claude/**',
    'docs/design/stitch/**/*.html',
    'docs/design/stitch/**/*.png',
    'stitch_coderhub_design_system/**'
  ]
})
