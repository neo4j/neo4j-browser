module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['raf/polyfill.js'],
  testPathIgnorePatterns: [
    '/e2e_tests/',
    '/coverage/',
    '/dist/',
    '/node_modules/'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|html)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '^browser-styles(.*)$': '<rootDir>/src/browser/styles$1',
    '^browser-components(.*)$': '<rootDir>/src/browser/components$1',
    'worker-loader': '<rootDir>/__mocks__/workerLoaderMock.js',
    'project-root(.*)$': '<rootDir>$1'
  },
  modulePaths: ['<rootDir>/src', '<rootDir>/src/shared'],
  collectCoverageFrom: ['**/src/**/*.js', '**/src/**/*.jsx'],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 20,
      lines: 20,
      functions: 25
    }
  }
}
