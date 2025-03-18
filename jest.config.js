module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        babelConfig: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/tests/**', '!src/**/index.ts'],
  coverageThreshold: {
    global: {
      branches: 8,
      functions: 16,
      lines: 8,
      statements: 8,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // For all tests, set a reasonable timeout
  testTimeout: 30000,
  // Project configurations
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/tests/unit/**/*.test.ts'],
      coverageDirectory: '<rootDir>/coverage/unit',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/tests/integration/**/*.test.ts'],
      setupFilesAfterEnv: [
        '<rootDir>/src/tests/setup.ts',
        '<rootDir>/src/tests/integration/jest.setup.ts'
      ],
      coverageDirectory: '<rootDir>/coverage/integration',
    },
  ],
  // Generate HTML and json reports
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage',
        filename: 'report.html',
        pageTitle: 'PhysiPro API Test Report',
      },
    ],
  ],
};
