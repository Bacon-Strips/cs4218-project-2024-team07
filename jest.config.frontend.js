const config = {
    "testEnvironment": "jest-environment-jsdom",
    "transform": {
      "^.+\\.jsx?$": "babel-jest"
    },
    "moduleNameMapper": {
      "\\.(css|scss)$": "identity-obj-proxy"
    },
    "transformIgnorePatterns": [
      "/node_modules/(?!(styleMock\\.js)$)"
    ],
    "setupFiles": [
      "./setup.jest.js",
    ],
    "setupFilesAfterEnv": ["./client/src/setup.jest.js"],
    "roots": ["./client"],
    "testMatch": ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(test).[jt]s?(x)"],
  };

export default config;
