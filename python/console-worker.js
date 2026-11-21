/* Python owns this worker; waiting for keyboard input never blocks the page. */
let python;
onmessage = async ({data}) => {
  const state = new Int32Array(data.inputBuffer, 0, 2);
  const bytes = new Uint8Array(data.inputBuffer, 8);
  try {
    if (!python) {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js');
      python = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/'});
    }
    postMessage({type:'running'});
    const decoder = new TextDecoder();
    const write = chunk => {
      const text = decoder.decode(chunk, {stream:true});
      if (text) postMessage({type:'output', text});
      return chunk.length;
    };
    python.setStdout({write, isatty:true});
    python.setStderr({write, isatty:true});
    python.setStdin({stdin: () => {
      Atomics.store(state, 0, 0);
      postMessage({type:'input'});
      Atomics.wait(state, 0, 0);
      if (Atomics.load(state, 0) === 2) return null;
      return bytes.slice(0, Atomics.load(state, 1));
    }, isatty:true});
    const scope = python.toPy({__name__:'__main__'});
    try { await python.runPythonAsync(data.code, {globals:scope}); }
    finally { scope.destroy(); }
    postMessage({type:'done'});
  } catch(error) { postMessage({type:'error', text:String(error)}); }
};
