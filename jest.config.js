module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: [
    'raf/polyfill.js',
    'jest-canvas-mock',
    '<rootDir>/node_modules/regenerator-runtime/runtime'
  ],
  setupFilesAfterEnv: [require.resolve('./test_utils/setupTests.js')],
  testPathIgnorePatterns: [
    '/e2e_tests/',
    '/coverage/',
    '/dist/',
    '/node_modules/'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!lodash-es|@neo4j/browser-lambda-parser|react-dnd|dnd-core)'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|html)$':
      '<rootDir>/test_utils/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/test_utils/__mocks__/styleMock.js',
    '^browser-styles(.*)$': '<rootDir>/src/browser/styles$1',
    '^browser-components(.*)$': '<rootDir>/src/browser/components$1',
    '^browser-hooks(.*)$': '<rootDir>/src/browser/hooks$1',
    'worker-loader': '<rootDir>/test_utils/__mocks__/workerLoaderMock.js',
    'project-root(.*)$': '<rootDir>$1'
  },
  modulePaths: ['<rootDir>/src', '<rootDir>/src/shared'],
  collectCoverageFrom: ['**/src/**/*.js', '**/src/**/*.jsx'],
  coverageThreshold: {
    global: {
      statements: 45,
      branches: 35,
      functions: 35,
      lines: 45
    }
  }
}
