module.exports = {
  root: true,   // 🔥 ADD THIS LINE

  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "script",
  },
  extends: ["eslint:recommended"],
  plugins: ["security"],
  rules: {
    "security/detect-object-injection": "warn",
    "security/detect-unsafe-regex": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-eval-with-expression": "warn",
    "security/detect-child-process": "warn",
  },
};