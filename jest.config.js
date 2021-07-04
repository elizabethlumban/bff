module.exports = {
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!**/__tests__/**', '!**/node_modules/**'],
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src', 'node_modules'],
  roots: ['src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  coverageReporters: ['json', 'lcov', 'text'],
  coveragePathIgnorePatterns: ['.*/src/.*\\.d\\.ts'],
  testResultsProcessor: 'jest-sonar-reporter',

  // FIXME: increase to 80+ each
  coverageThreshold: {
    global: {
      statements: 1,
      branches: 1,
      functions: 1,
      lines: 1
    }
  },
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
