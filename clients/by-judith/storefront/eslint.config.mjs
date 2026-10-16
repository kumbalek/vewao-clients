import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

// Next 16: flat config; `next lint` is gone, so `pnpm lint` runs ESLint directly.
const config = [
  ...nextCoreWebVitals,
  {
    // React Compiler rules new in eslint-plugin-react-hooks 7 (Next 16). They flag
    // existing, working effects (mostly the inherited starter's checkout and
    // account forms). Warn until those are refactored with their own tests,
    // rather than rewriting checkout inside a framework upgrade.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]

export default config
