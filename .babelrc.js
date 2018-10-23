const isTest = String(process.env.NODE_ENV) === 'test' // Jest sets this

const toExport = {
  plugins: [
    'react-hot-loader/babel',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import',
    'styled-components'
  ],
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        modules: isTest ? 'commonjs' : false
      }
    ],
    '@babel/preset-react'
  ]
}

if (isTest) {
  toExport.plugins.push('babel-plugin-dynamic-import-node')
}

module.exports = toExport
