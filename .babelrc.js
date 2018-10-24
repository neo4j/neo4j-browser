const isTest = String(process.env.NODE_ENV) === 'test' // Jest sets this

const toExport = {
  plugins: [
    'react-hot-loader/babel',
    'styled-components',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-syntax-dynamic-import'
  ],
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        modules: isTest ? 'commonjs' : false,
        targets: {
          browsers: ['last 1 version', 'ie >= 11']
        }
      }
    ]
  ]
}

if (isTest) {
  toExport.plugins.push('babel-plugin-dynamic-import-node')
}

module.exports = toExport
