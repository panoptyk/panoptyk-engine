import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      name: "panoptyk",
      output: "./dist",
      format: "umd"
    }
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "fs",
    "http"
  ],
  plugins: [
    typescript({
      typescript: require("typescript")
    })
  ]
};
