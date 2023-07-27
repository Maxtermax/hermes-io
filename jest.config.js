module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  coverageReporters: ['html', 'text-summary'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
