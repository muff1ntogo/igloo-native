module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/jest.native-modules.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },
};







