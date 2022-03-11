module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
    testPathIgnorePatterns: ['/__tests__/.*\\.mock.ts'],
    clearMocks: true,
    preset: 'ts-jest',
    setupFilesAfterEnv: [
        '<rootDir>/__tests__/mocks/prisma.mock.ts',
        '<rootDir>/__tests__/mocks/console.mock.ts',
    ],
};
