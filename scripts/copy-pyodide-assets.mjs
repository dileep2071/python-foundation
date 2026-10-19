import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const packageDirectory = resolve('node_modules/pyodide')
const publicDirectory = resolve('public/pyodide')
const runtimeFiles = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']

mkdirSync(publicDirectory, { recursive: true })
for (const file of runtimeFiles) {
  copyFileSync(resolve(packageDirectory, file), resolve(publicDirectory, file))
}
