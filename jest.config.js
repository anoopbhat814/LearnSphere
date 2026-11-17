module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/api/src', '<rootDir>/packages'],
  moduleNameMapper: { '^@learnsphere/shared-types$': '<rootDir>/packages/shared-types/src' },
};
