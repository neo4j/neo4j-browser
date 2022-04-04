import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'

const packageJson = require('./package.json')
const name = packageJson.main.replace(/\.js$/, '')

const dependenciesNotToBundle = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.peerDependencies
}).concat(['@neo4j-ndl/base/lib/tokens/js/tokens'])

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
    plugins: [dts({ respectExternal: true }), alias({ entries: aliasEntries })],
    output: {
      file: `${name}.d.ts`,
      format: 'es'
    }
  })
]
