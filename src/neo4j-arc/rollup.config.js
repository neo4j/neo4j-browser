import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'

const packageJson = require('./package.json')
const name = packageJson.main.replace(/\.js$/, '')

const importsWithPaths = [
  '@neo4j-ndl/base/lib/tokens/js/tokens',
  'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList',
  'monaco-editor/esm/vs/editor/editor.api',
  'cypher-editor-support/src/_generated/CypherLexer'
]

const dependenciesNotToBundle = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.peerDependencies
}).concat(importsWithPaths)

const bundle = config => ({
  ...config,
  input: 'index.ts',
  external: id => dependenciesNotToBundle.includes(id)
})

const aliasEntries = [
  { find: 'neo4j-arc/common', replacement: './common/index.ts' }
]

export default [
  bundle({
    plugins: [esbuild(), alias({ entries: aliasEntries })],
    output: [
      {
        file: `${name}.js`,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true
      }
    ]
  }),
  // Build types
  bundle({
    plugins: [dts(), alias({ entries: aliasEntries })],
    output: {
      file: `${name}.d.ts`,
      format: 'es'
    }
  })
]
