export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.mjs$': 'babel-jest', // Transform .mjs files using Babel
    '^.+\\.[tj]sx?$': 'babel-jest', // Transform .js, .ts, and .jsx files as well
  },
  moduleFileExtensions: ['js', 'mjs'],
  transformIgnorePatterns: ['/node_modules/'],
};
