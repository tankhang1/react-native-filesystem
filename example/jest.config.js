module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  watchman: false,
  roots: ['<rootDir>/example'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/example/tsconfig.jest.json',
      },
    ],
  },
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react-native-filesystem$': '<rootDir>/src/index.ts',
    '^react-native-filesystem/(.*)$': '<rootDir>/src/$1',
  },
};
