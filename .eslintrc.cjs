module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    '.eslintrc.cjs',
    'supabase/functions', // Deno runtime, not linted by this browser config
    'design_handoff_voltage_redesign', // design reference bundle, not app source
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    // Context providers intentionally export a companion hook next to the provider,
    // and Badge exports a status helper alongside the component — allow it.
    'react-refresh/only-export-components': 'off',
    // Cosmetic; apostrophes in copy are fine.
    'react/no-unescaped-entities': 'off',
    // No prop-types in this codebase by convention.
    'react/prop-types': 'off',
    // exhaustive-deps stays a warning (informative, non-blocking).
  },
}
