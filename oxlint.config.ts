import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import jsPlugins from 'ultracite/oxlint/js-plugins'
import nextJsPlugins from 'ultracite/oxlint/next/js-plugins'

export default defineConfig({
  extends: [core, next, jsPlugins, nextJsPlugins],
  // Propuesta 2 equilibrada audit-gated: todo warn en local, CI con || true hasta triage
  // TODO: subir a error tras triage de 128 pendientes
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
  ignorePatterns: core.ignorePatterns
})
