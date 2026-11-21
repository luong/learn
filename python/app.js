const $ = id => document.getElementById(id);
const fallback = $('code');
let editor = null;
// Keep the plain editor usable if the Monaco CDN is unavailable.
const code = {
  get value() { return editor ? editor.getValue() : fallback.value; },
  set value(value) { if (editor) editor.setValue(value); else fallback.value = value; },
  get selectionStart() { return editor ? editor.getModel().getOffsetAt(editor.getPosition()) : fallback.selectionStart; }
};
const initial = '';
try { code.value = localStorage.getItem('python-editor-code') ?? initial; }
catch { code.value = initial; }
let inputBuffer = null;
let waitingForInput = false;
let worker = null;
let pythonReady = false;
let editorReady = false;
const loadErrors = new Map();
function showLoadState() {
  if (loadErrors.size) $('status').textContent = [...loadErrors.values()].join(' ');
  else if (!busy) $('status').textContent = pythonReady && editorReady ? 'Ready' : pythonReady ? 'Loading editor…' : 'Loading Python…';
}
let busy = false;
let outputSize = 0;
function update() {
  $('lines').textContent = Array.from({length: code.value.split('\n').length}, (_, i) => i + 1).join('\n');
  try { localStorage.setItem('python-editor-code', code.value); }
  catch { $('status').textContent = 'Unable to save locally.'; }
}
function append(value) {
  const room = 100000 - outputSize;
  if (room <= 0) return;
  const part = String(value).slice(0, room);
  $('output').textContent += part;
  outputSize += part.length;
  if (outputSize >= 100000) $('output').textContent += '\n[Output limited to 100,000 characters]';
  $('console').scrollTop = $('console').scrollHeight;
}
function setBusy(value) {
  busy = value;
  if (!value) setWaiting(false);
  $('run').disabled = value;
  $('stop').disabled = !value;
}
function setWaiting(value) {
  waitingForInput = value;
  $('console-form').hidden = !value;
  $('console-input').disabled = !value;
  $('send').disabled = !value;
  if (value) {
    $('status').textContent = 'Waiting for input — type in the console and press Enter.';
    $('console-input').focus();
    $('console').scrollTop = $('console').scrollHeight;
  }
}
function createWorker() {
  const instance = new Worker('console-worker.js');
  const failLoad = message => {
    clearTimeout(loadTimer);
    instance.terminate();
    if (worker === instance) worker = null;
    pythonReady = false;
    setBusy(false);
    loadErrors.set('python', message);
    showLoadState();
  };
  const loadTimer = setTimeout(() => failLoad('Python loading timed out. Check your connection and click Run to retry.'), 60000);
  instance.onmessage = ({data}) => {
    if (data.type === 'ready') {
      clearTimeout(loadTimer);
      loadErrors.delete('python');
      pythonReady = true;
      $('run').disabled = busy;
      showLoadState();
    }
    if (data.type === 'load-error') {
      failLoad('Unable to load Python. Check your connection and click Run to retry.');
      return;
    }
    if (data.type === 'input') setWaiting(true);
    if (data.type === 'running') { clearTimeout(loadTimer); $('status').textContent = 'Running Python…'; }
    if (data.type === 'output') append(data.text);
    if (data.type === 'done' || data.type === 'error') {
      if (data.type === 'error') append(data.text + '\n');
      $('status').textContent = data.type === 'done' ? 'Ready' : 'An error occurred. Check the console, edit your code and run again.';
      setBusy(false);
      if (loadErrors.size) showLoadState();
    }
  };
  instance.onerror = event => {
    event.preventDefault();
    failLoad('Unable to load Python. Check your connection and click Run to retry.');
  };
  return instance;
}
$('run').onclick = () => {
  if (busy) return;
  if (!crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
    $('status').textContent = 'Console is initializing. If it remains unavailable, reload the page using localhost or HTTPS.';
    return;
  }
  $('output').textContent = ''; outputSize = 0;
  setBusy(true);
  $('status').textContent = worker ? 'Preparing to run…' : 'Loading Python for the first time, please wait…';
  try { inputBuffer = new SharedArrayBuffer(65544); worker ??= createWorker(); worker.postMessage({code:code.value, inputBuffer}); }
  catch(error) { append(String(error)); setBusy(false); $('status').textContent = 'Unable to start Python.'; }
};
$('stop').onclick = () => {
  worker?.terminate(); worker = null; pythonReady = false; setBusy(false);
  append('\n[Program stopped]\n');
  $('status').textContent = 'Stopped. Python will restart on the next run.';
};
$('clear').onclick = () => { $('output').textContent = ''; outputSize = 0; };
$('download').onclick = () => {
  const url = URL.createObjectURL(new Blob([code.value], {type:'text/x-python;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = 'main.py'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$('open').onclick = () => $('file').click();
$('file').onchange = async event => {
  const file = event.target.files[0];
  if (file) {
    try { code.value = await file.text(); update(); $('status').textContent = 'Opened ' + file.name; }
    catch { $('status').textContent = 'Unable to read the file.'; }
  }
  event.target.value = '';
};
fallback.addEventListener('input', update);
fallback.addEventListener('click', update);
fallback.addEventListener('keyup', update);
fallback.addEventListener('scroll', () => { $('lines').scrollTop = fallback.scrollTop; });
fallback.addEventListener('keydown', event => {
  if (event.key === 'Tab') {
    event.preventDefault();
    fallback.setRangeText('    ', fallback.selectionStart, fallback.selectionEnd, 'end'); update();
  }
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); $('run').click(); }
});
update();

// Pin the build so this static GitHub Pages editor remains reproducible.
const monacoBase = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/';
const loader = document.createElement('script');
loader.src = monacoBase + 'vs/loader.js';
const editorLoadTimer = setTimeout(() => loader.onerror(), 60000);
loader.onerror = () => {
  clearTimeout(editorLoadTimer);
  loadErrors.set('editor', 'Unable to load Monaco. The basic editor is available; reload the page to retry.');
  showLoadState();
};
loader.onload = () => {
  window.MonacoEnvironment = {
    getWorkerUrl() {
      const source = `self.MonacoEnvironment = { baseUrl: '${monacoBase}' }; importScripts('${monacoBase}vs/base/worker/workerMain.js');`;
      return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(source);
    }
  };
  window.require.config({paths: {vs: monacoBase + 'vs'}});
  window.require(['vs/editor/editor.main'], () => {
    const container = $('monaco');
    container.hidden = false;
    try {
      editor = monaco.editor.create(container, {
        value: fallback.value,
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 15,
        lineHeight: 26,
        fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
        minimap: {enabled: false},
        padding: {top: 20, bottom: 20},
        tabSize: 4,
        insertSpaces: true,
        scrollBeyondLastLine: false,
        wordWrap: 'off',
        ariaLabel: 'Python code',
        bracketPairColorization: {enabled: true},
        unicodeHighlight: {
          ambiguousCharacters: false,
          invisibleCharacters: false,
          nonBasicASCII: false
        }
      });
      fallback.hidden = true;
      $('lines').hidden = true;
      editor.onDidChangeModelContent(update);
      editor.onDidChangeCursorPosition(update);
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => $('run').click());
      update();
      clearTimeout(editorLoadTimer);
      loadErrors.delete('editor');
      editorReady = true;
      showLoadState();
    } catch (error) {
      container.hidden = true;
      loader.onerror();
    }
  }, loader.onerror);
};
document.head.appendChild(loader);

$('console-form').onsubmit = event => {
  event.preventDefault();
  if (!waitingForInput) return;
  const text = $('console-input').value;
  const bytes = new TextEncoder().encode(text + '\n');
  if (bytes.length > 65536) {
    $('status').textContent = 'Input line is too long (64 KB maximum).';
    return;
  }
  new Uint8Array(inputBuffer, 8).set(bytes);
  const state = new Int32Array(inputBuffer, 0, 2);
  Atomics.store(state, 1, bytes.length);
  append(text + '\n');
  $('console-input').value = '';
  setWaiting(false);
  $('status').textContent = 'Running Python…';
  Atomics.store(state, 0, 1);
  Atomics.notify(state, 0);
};
$('console-input').addEventListener('keydown', event => {
  if (event.ctrlKey && (event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'd')) {
    event.preventDefault();
    if (event.key.toLowerCase() === 'c') $('stop').click();
    else if (waitingForInput) {
      const state = new Int32Array(inputBuffer, 0, 2);
      setWaiting(false);
      Atomics.store(state, 0, 2);
      Atomics.notify(state, 0);
    }
  }
});
async function prepareConsole() {
  if (crossOriginIsolated) {
    $('status').textContent = 'Loading Python…';
    try {
      worker = createWorker();
      worker.postMessage({type:'init'});
    } catch (error) {
      $('run').disabled = false;
      $('status').textContent = 'Unable to load Python: ' + error.message;
    }
    return;
  }
  if (!('serviceWorker' in navigator) || !isSecureContext) {
    $('status').textContent = 'Open this page using localhost or HTTPS to use the console.';
    return;
  }
  try {
    const reload = () => {
      if (!sessionStorage.getItem('console-isolation-reload')) {
        sessionStorage.setItem('console-isolation-reload', '1');
        location.reload();
      } else {
        $('status').textContent = 'Unable to initialize the console. Close this site’s tabs and open it again.';
      }
    };
    navigator.serviceWorker.addEventListener('controllerchange', reload, {once:true});
    await navigator.serviceWorker.register('console-sw.js');
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) reload();
  } catch (error) {
    $('status').textContent = 'Unable to initialize the console: ' + error.message;
  }
}
if (crossOriginIsolated) sessionStorage.removeItem('console-isolation-reload');
prepareConsole();

function sizeConsoleInput() {
  $('console-input').style.width = Math.max(2, Array.from($('console-input').value).length + 1) + 'ch';
}
$('console-input').addEventListener('input', sizeConsoleInput);
$('console-form').addEventListener('submit', sizeConsoleInput);
$('console').addEventListener('click', () => {
  if (waitingForInput && !window.getSelection()?.toString()) $('console-input').focus();
});
$('console').addEventListener('keydown', event => {
  if (event.ctrlKey && event.key.toLowerCase() === 'c' && busy && !window.getSelection()?.toString()) {
    event.preventDefault();
    $('stop').click();
  }
});
sizeConsoleInput();
