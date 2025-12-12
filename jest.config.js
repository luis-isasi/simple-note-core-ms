module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.+(spec|test).ts?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/.aws-sam'],
  clearMocks: true,
  reporters: ['default', 'jest-junit'],
  coverageThreshold: {
    global: {
      statements: 30,
    },
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          transform: {
            useDefineForClassFields: false,
          },
        },
      },
    ],
  },
};
