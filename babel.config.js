const isTest = String(process.env.NODE_ENV) === 'test' // Jest sets this

const toExport = {
  plugins: [
    'react-hot-loader/babel',
    'styled-components',
    '@babel/plugin-proposal-class-properties',
    'babel-plugin-dynamic-import-node'
  ],
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: 3,
        modules: isTest ? 'commonjs' : false,
        targets: {
          browsers: ['last 1 version', 'not ie > 0']
        }
      }
    ]
  ]
}

module.exports = toExport
