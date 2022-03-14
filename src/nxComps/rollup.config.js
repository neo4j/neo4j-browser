import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import svg from 'rollup-plugin-svg'
import alias from '@rollup/plugin-alias'

const name = require('./package.json').main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  input: 'index.ts',
  external: id => id === 'react' // !/^[./]/.test(id),
  // hantera genom Peer dependencies istället?
})

export default [
  bundle({
    plugins: [
      svg(),
      esbuild(),
      commonjs(),
      nodeResolve(),
      alias({
        entries: [{ find: 'nxComps/common', replacement: './common/index.ts' }]
      })
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
  bundle({
    plugins: [
      dts(),
      alias({
        entries: [{ find: 'nxComps/common', replacement: './common/index.ts' }]
      })
    ],
    output: {
      file: `${name}.d.ts`,
      format: 'es'
    }
  })
]
