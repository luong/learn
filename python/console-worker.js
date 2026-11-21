/* Python owns this worker; waiting for keyboard input never blocks the page. */
let python;
onmessage = async ({data}) => {
  try {
    if (!python) {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js');
      python = await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/'});
    }
    postMessage({type:'ready'});
    if (data.type === 'init') {
      return;
    }
    const mode = data.mode || 'console';
    postMessage({type:'running'});
    const decoder = new TextDecoder();
    const write = chunk => {
      const text = decoder.decode(chunk, {stream:true});
      if (text) postMessage({type:'output', text});
      return chunk.length;
    };
    python.setStdout({write, isatty:mode === 'console'});
    python.setStderr({write, isatty:mode === 'console'});
    if (mode === 'console') {
      const state = new Int32Array(data.inputBuffer, 0, 2);
      const bytes = new Uint8Array(data.inputBuffer, 8);
      python.setStdin({stdin: () => {
        Atomics.store(state, 0, 0);
        postMessage({type:'input'});
        Atomics.wait(state, 0, 0);
        if (Atomics.load(state, 0) === 2) return null;
        return bytes.slice(0, Atomics.load(state, 1));
      }, isatty:true});
    } else {
      const input = new TextEncoder().encode(mode === 'predefined' ? data.input : '');
      let offset = 0;
      python.setStdin({read: buffer => {
        const length = Math.min(buffer.length, input.length - offset);
        buffer.set(input.subarray(offset, offset + length));
        offset += length;
        return length;
      }, isatty:false});
    }
    // Restore a predictable working directory even if a previous program changed it.
    python.FS.chdir('/home/pyodide');
    if (mode === 'file') {
      python.FS.writeFile('input.txt', data.input, {encoding:'utf8'});
      if (python.FS.analyzePath('output.txt').exists) python.FS.unlink('output.txt');
    }
    const scope = python.toPy({__name__:'__main__'});
    try { await python.runPythonAsync(data.code, {globals:scope}); }
    finally {
      scope.destroy();
      if (mode === 'file') {
        const path = '/home/pyodide/output.txt';
        if (python.FS.analyzePath(path).exists) {
          const size = python.FS.stat(path).size;
          const length = Math.min(size, 100000);
          const bytes = new Uint8Array(length);
          const stream = python.FS.open(path, 'r');
          try { python.FS.read(stream, bytes, 0, length, 0); }
          finally { python.FS.close(stream); }
          const text = new TextDecoder().decode(bytes) + (size > length ? '\n[Output limited to 100,000 bytes]' : '');
          postMessage({type:'file-output', text, truncated:size > length});
        } else {
          postMessage({type:'file-output', text:'', missing:true});
          postMessage({type:'output', text:'No output.txt was created. Write to output.txt using open() in your code.\n'});
        }
      }
    }
    postMessage({type:'done'});
  } catch(error) {
    if (!python) {
      postMessage({type:'load-error'});
    } else if (error.name === 'PythonError') {
      // Show user code frames while hiding the runtime's Python bridge frames.
      const lines = String(error).replace(/^PythonError:\s*/, '').split('\n');
      let internalFrame = false;
      const visible = lines.filter(line => {
        const frame = line.match(/^\s*File "([^"]+)"/);
        if (frame) internalFrame = !['<exec>', '<string>', '<stdin>'].includes(frame[1]);
        else if (line && !/^\s/.test(line)) internalFrame = false;
        return !internalFrame;
      });
      postMessage({type:'error', text:visible.join('\n').trim()});
    } else {
      postMessage({type:'error', text:'Unable to run the program. Please try again.'});
    }
  }
};
