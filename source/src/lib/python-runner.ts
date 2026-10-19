export type PythonRunResult = {
  output: string
  error: boolean
}

let pythonWorker: Worker | undefined

export function runPython(code: string, timeoutMs = 15_000): Promise<PythonRunResult> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      pythonWorker ??= new Worker(`${import.meta.env.BASE_URL}python-worker.js`, { type: 'module' })
      worker = pythonWorker
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The browser could not create a Python worker.'
      resolve({ output: `Python runtime unavailable: ${detail}`, error: true })
      return
    }
    let finished = false

    function finish(result: PythonRunResult) {
      if (finished) return
      finished = true
      window.clearTimeout(timeout)
      worker.onmessage = null
      worker.onerror = null
      resolve(result)
    }

    const timeout = window.setTimeout(() => {
      worker.terminate()
      pythonWorker = undefined
      finish({
        output: `Execution stopped after ${Math.round(timeoutMs / 1000)} seconds. Check for an infinite loop or expensive operation.`,
        error: true,
      })
    }, timeoutMs)

    worker.onmessage = (event: MessageEvent<{ type: string; output: string }>) => {
      finish({ output: event.data.output, error: event.data.type === 'error' })
    }

    worker.onerror = (event) => {
      worker.terminate()
      pythonWorker = undefined
      finish({ output: event.message || 'The Python runtime could not start.', error: true })
    }

    try {
      worker.postMessage({ code })
    } catch (error) {
      worker.terminate()
      pythonWorker = undefined
      const detail = error instanceof Error ? error.message : 'The browser could not send code to the Python worker.'
      finish({ output: `Python runtime unavailable: ${detail}`, error: true })
    }
  })
}
