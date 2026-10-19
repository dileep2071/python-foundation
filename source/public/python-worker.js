import { loadPyodide } from './pyodide/pyodide.mjs'

let runtime

self.onmessage = async ({ data }) => {
  let output = ''
  try {
    if (!runtime) {
      runtime = await loadPyodide({
        indexURL: new URL('./pyodide/', import.meta.url).href,
      })
    }

    runtime.setStdout({ batched: (text) => { output += `${text}\n` } })
    runtime.setStderr({ batched: (text) => { output += `${text}\n` } })
    await runtime.runPythonAsync(data.code)
    self.postMessage({
      type: 'success',
      output: output.trimEnd() || '(No output. Use print() to display a value.)',
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Python could not run this code.'
    self.postMessage({ type: 'error', output: output ? `${output.trimEnd()}\n${detail}` : detail })
  }
}
