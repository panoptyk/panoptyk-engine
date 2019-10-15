import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

export default {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        output: "./dist",
        format: 'cjs'
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      "fs",
      "http"
    ],plugins: [
      typescript({
        typescript: require('typescript'),
      }),
    ],
  }