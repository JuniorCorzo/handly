import { defineConfig } from 'oxlint'
import core from 'ultracite/oxlint/core'
import next from 'ultracite/oxlint/next'
import jsPlugins from 'ultracite/oxlint/js-plugins'
import nextJsPlugins from 'ultracite/oxlint/next/js-plugins'

export default defineConfig({
  extends: [core, next, jsPlugins, nextJsPlugins],
  ignorePatterns: core.ignorePatterns
})
