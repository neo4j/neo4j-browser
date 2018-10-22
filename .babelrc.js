const isTest = String(process.env.NODE_ENV) === 'test' // Jest sets this

module.exports = {
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
