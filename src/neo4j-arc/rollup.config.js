import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import svg from 'rollup-plugin-svg'
import alias from '@rollup/plugin-alias'

const packageJson = require('./package.json')
const name = packageJson.main.replace(/\.js$/, '')

const dependenciesNotToBundle = Object.keys(
  packageJson.peerDependencies
).concat(['@neo4j-ndl/base/lib/tokens/js/tokens'])

const bundle = config => ({
  ...config,
  input: 'index.ts',
  external: id => dependenciesNotToBundle.includes(id),

  // We get some warnings that we don't care about
  // https://github.com/d3/d3-selection/issues/168
  // https://github.com/moment/luxon/issues/193
  onwarn: function (warning, warn) {
    if (
      !(
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        ( ['d3','luxon', 'antlr'].some(dep => warning.toString().includes(dep)))
    ) ){
      warn(warning)
    }
  }
})

const aliasEntries = [
  { find: 'neo4j-arc/common', replacement: './common/index.ts' }
]

export default [
  bundle({
    plugins: [
      svg(),
      esbuild(),
      commonjs(),
      nodeResolve(),
      alias({ entries: aliasEntries })
    ],
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
