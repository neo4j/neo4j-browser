import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import svg from 'rollup-plugin-svg'
import alias from '@rollup/plugin-alias'
import css from 'rollup-plugin-postcss'
import monaco from 'rollup-plugin-monaco-editor'

const name = require('./package.json').main.replace(/\.js$/, '')

const dependenciesNotToBundle = ['react']
const bundle = config => ({
  ...config,
  input: 'index.ts',
  external: id => dependenciesNotToBundle.includes(id),

  // We get warnings that we don't need to care about from d3
  //https://github.com/d3/d3-selection/issues/168
  onwarn: function (warning, warn) {
    if (
      !(
        warning.code === 'CIRCULAR_DEPENDENCY' &&
        warning.toString().includes('d3')
      )
    ) {
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
      css(),
      svg(),
      monaco({
        languages: ['json']
      }),
      esbuild(),
      commonjs(),
      nodeResolve(),
      alias({ entries: aliasEntries })
    ],
    output: [
      {
        //file: `${name}.js`,
        dir: 'cjs-dist',
        format: 'cjs',
        sourcemap: true
        //inlineDynamicImports: true
      },
      {
        dir: 'es-dist',
        //file: `${name}.mjs`,
        format: 'es',
        sourcemap: true
        //inlineDynamicImports: true
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
