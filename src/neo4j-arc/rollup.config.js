import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import pkg from './package.json'

const importsWithPaths = [
  '@neo4j-ndl/base/lib/tokens/js/tokens',
  'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList',
  'monaco-editor/esm/vs/editor/editor.api',
  'monaco-editor/esm/vs/editor/editor.main.js'
]

const dependenciesNotToBundle = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies
}).concat(importsWithPaths)

const aliasEntries = [
  { find: 'neo4j-arc/common', replacement: './common/index.ts' }
]

export default [
  {
    input: 'index.ts',
    external: id => dependenciesNotToBundle.includes(id),
    plugins: [/* handles ts */ esbuild(), alias({ entries: aliasEntries })],
    output: [
      {
        file: pkg.main,
        format: 'es',
        sourcemap: true
      }
    ]
  },
  // Build types
  {
    input: 'index.ts',
    plugins: [dts(), alias({ entries: aliasEntries })],
    output: {
      file: pkg.typings,
      format: 'es'
    }
  }
]
