import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default {
  input: "src/client.ts",
  output: [
    {
      file: "./dist/client.js",
      output: "./dist",
      format: "cjs"
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
