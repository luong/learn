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
  else if (!crossOriginIsolated) $('status').textContent = 'Initializing console…';
  else if (!busy) $('status').textContent = pythonReady && editorReady ? 'Ready' : pythonReady ? 'Loading editor…' : 'Loading Python…';
}
let busy = false;
let outputSize = 0;
let testRun = null;
let testCases = {predefined: [{input:'', expected:''}], file: [{input:'', expected:''}]};
try {
  const saved = JSON.parse(localStorage.getItem('python-editor-tests'));
  for (const mode of ['predefined', 'file']) {
    if (Array.isArray(saved?.[mode]) && saved[mode].length && saved[mode].every(c => typeof c.input === 'string' && typeof c.expected === 'string')) testCases[mode] = saved[mode];
  }
} catch {}
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
  $('io-mode').disabled = value;
  $('add-case').disabled = value;
  $('clear').disabled = value;
  document.querySelectorAll('#test-cases textarea, #test-cases button').forEach(el => { el.disabled = value || (el.tagName === 'BUTTON' && $('test-cases').children.length === 1); });
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
    abortTests('Error');
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
    if (data.type === 'output') {
      if (testRun) {
        const test = testRun.cases[testRun.index];
        test.console += data.text.slice(0, Math.max(0, 100000 - test.console.length));
        if (data.text.length + test.length > 100000) test.truncated = true;
        test.length += data.text.length;
      } else append(data.text);
    }
    if (data.type === 'file-output' && testRun) {
      const test = testRun.cases[testRun.index];
      test.actual = data.text;
      test.missingFile = data.missing;
      test.truncated ||= data.truncated;
    }
    if (data.type === 'done' || data.type === 'error') {
      if (testRun) { finishTestCase(data); return; }
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
  if ($('io-mode').value === 'console' && (!crossOriginIsolated || typeof SharedArrayBuffer === 'undefined')) {
    $('status').textContent = 'Console is initializing. If it remains unavailable, reload the page using localhost or HTTPS.';
    return;
  }
  $('output').textContent = ''; outputSize = 0;
  setBusy(true);
  $('status').textContent = worker ? 'Preparing to run…' : 'Loading Python for the first time, please wait…';
  try {
    worker ??= createWorker();
    if ($('io-mode').value !== 'console') { startTests(); return; }
    inputBuffer = new SharedArrayBuffer(65544);
    worker.postMessage({code:code.value, inputBuffer, mode:'console'});
  }
  catch { abortTests('Error'); setBusy(false); $('status').textContent = 'Unable to start Python. Please try again.'; }
};
$('stop').onclick = () => {
  worker?.terminate(); worker = null; pythonReady = false; abortTests('Stopped'); setBusy(false);
  append('\n[Program stopped]\n');
  $('status').textContent = 'Stopped. Python will restart on the next run.';
};
$('clear').onclick = () => {
  if (busy) return;
  $('output').textContent = ''; outputSize = 0;
  renderTestCases();
};
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
        fontSize: 16,
        lineNumbersMinChars: 2,
        lineDecorationsWidth: 5,
        glyphMargin: false,
        lineHeight: 26,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
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
  const isolationParameter = '__python_console_init';
  if (crossOriginIsolated) {
    // Recovery uses a fresh navigation so hard-reload's worker bypass is not inherited.
    // Remove its temporary marker once this document has the isolation headers.
    const cleanURL = new URL(location.href);
    if (cleanURL.searchParams.has(isolationParameter)) {
      cleanURL.searchParams.delete(isolationParameter);
      history.replaceState(history.state, '', cleanURL);
    }
    $('status').textContent = 'Loading Python…';
    try {
      worker = createWorker();
      worker.postMessage({type:'init'});
    } catch (error) {
      $('run').disabled = false;
      $('status').textContent = 'Unable to load Python. Check your connection and try again.';
    }
    return;
  }
  if (!('serviceWorker' in navigator) || !isSecureContext) {
    $('status').textContent = 'Open this page using localhost or HTTPS to use the console.';
    return;
  }
  $('status').textContent = 'Initializing console…';
  let reloadScheduled = false;
  let initializationTimer;
  const navigate = () => {
    if (reloadScheduled) return;
    reloadScheduled = true;
    clearTimeout(initializationTimer);
    navigator.serviceWorker.removeEventListener('controllerchange', navigate);
    const nextURL = new URL(location.href);
    const marker = /^(\d+):(\d+)$/.exec(nextURL.searchParams.get(isolationParameter) || '');
    const elapsed = marker ? Date.now() - Number(marker[1]) : Infinity;
    const attempts = elapsed >= 0 && elapsed < 60000 ? Number(marker[2]) : 0;
    if (attempts >= 2) {
      loadErrors.set('console', 'Unable to enable the console. Check browser service worker settings, then reload.');
      showLoadState();
      return;
    }
    // location.reload() can retain the bypass flag from Cmd/Ctrl+Shift+R.
    // A different URL starts a normal navigation through the active worker.
    // The URL marker limits retries without depending on sessionStorage.
    nextURL.searchParams.set(isolationParameter, `${Date.now()}:${attempts + 1}`);
    location.replace(nextURL.href);
  };
  try {
    initializationTimer = setTimeout(() => {
      reloadScheduled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', navigate);
      loadErrors.set('console', 'Console initialization timed out. Check your connection and reload the page.');
      showLoadState();
    }, 15000);
    navigator.serviceWorker.addEventListener('controllerchange', navigate);
    await navigator.serviceWorker.register('console-sw.js', {updateViaCache:'none'});
    await navigator.serviceWorker.ready;
    // An existing active worker may never emit controllerchange after Shift+Reload.
    // Its ready promise is sufficient to start the recovery navigation.
    navigate();
  } catch (error) {
    clearTimeout(initializationTimer);
    navigator.serviceWorker.removeEventListener('controllerchange', navigate);
    loadErrors.set('console', 'Unable to initialize the console. Please reload the page.');
    showLoadState();
  }
}
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

function saveTests() {
  try { localStorage.setItem('python-editor-tests', JSON.stringify(testCases)); }
  catch { $('status').textContent = 'Unable to save test cases locally.'; }
}
function normalizeOutput(value) {
  return value.replace(/\r\n/g, '\n').replace(/\n$/, '');
}
function renderTestCases() {
  const mode = $('io-mode').value;
  if (mode === 'console') return;
  $('test-cases').replaceChildren();
  testCases[mode].forEach((test, index) => {
    const card = document.createElement('article');
    card.className = 'test-case';
    const heading = document.createElement('div'); heading.className = 'case-heading';
    const title = document.createElement('strong'); title.textContent = `Test case ${index + 1}`;
    const badge = document.createElement('span'); badge.className = 'case-status'; badge.textContent = 'Not run';
    const remove = document.createElement('button'); remove.textContent = 'Remove'; remove.disabled = testCases[mode].length === 1;
    remove.onclick = () => { if (busy || testCases[mode].length === 1) return; testCases[mode].splice(index, 1); saveTests(); renderTestCases(); };
    heading.append(title, badge, remove); card.append(heading);
    const fields = document.createElement('div'); fields.className = 'case-fields';
    for (const [key, name] of [['input', mode === 'file' ? 'Input · input.txt' : 'Input'], ['expected', mode === 'file' ? 'Output · output.txt' : 'Output']]) {
      const label = document.createElement('label'); label.textContent = name;
      const area = document.createElement('textarea'); area.rows = 2; area.spellcheck = false; area.value = test[key];
      area.setAttribute('aria-label', `${name}, test case ${index + 1}`);
      area.placeholder = key === 'input' ? 'Enter input…' : 'Enter output…';
      area.oninput = () => { test[key] = area.value; saveTests(); $('test-summary').textContent = 'Test cases modified — run to check'; badge.textContent = 'Not run'; badge.className = 'case-status'; details.hidden = true; };
      label.append(area); fields.append(label);
    }
    card.append(fields);
    const details = document.createElement('details'); details.hidden = true; details.className = 'case-result';
    const summary = document.createElement('summary'); summary.textContent = 'Actual output';
    const actual = document.createElement('pre');
    const log = document.createElement('pre'); log.className = 'case-log'; log.hidden = true;
    details.append(summary, actual, log); card.append(details);
    $('test-cases').append(card);
  });
  $('test-summary').textContent = `${testCases[mode].length} test case${testCases[mode].length === 1 ? '' : 's'}`;
}
function updateIOMode() {
  const mode = $('io-mode').value;
  const batch = mode !== 'console';
  $('test-panel').hidden = !batch;
  $('console').hidden = batch;
  document.querySelector('.result-panel').classList.toggle('batch-mode', batch);
  setWaiting(false);
  renderTestCases();
}
function startTests() {
  const mode = $('io-mode').value;
  renderTestCases();
  setBusy(true);
  testRun = {mode, code:code.value, index:0, cases:testCases[mode].map(test => ({...test, actual:'', console:'', length:0, truncated:false}))};
  runNextTestCase();
}
function runNextTestCase() {
  const test = testRun.cases[testRun.index];
  const card = $('test-cases').children[testRun.index];
  card.querySelector('.case-status').textContent = 'Running…';
  $('test-summary').textContent = `Running ${testRun.index + 1} / ${testRun.cases.length}`;
  $('status').textContent = `Running test case ${testRun.index + 1}…`;
  worker.postMessage({code:testRun.code, mode:testRun.mode, input:test.input});
}
function finishTestCase(data) {
  const test = testRun.cases[testRun.index];
  if (testRun.mode === 'predefined') test.actual = test.console;
  test.error = data.type === 'error' ? data.text : '';
  test.passed = !test.error && !test.missingFile && !test.truncated && normalizeOutput(test.actual) === normalizeOutput(test.expected);
  const card = $('test-cases').children[testRun.index];
  const badge = card.querySelector('.case-status');
  badge.textContent = test.error || test.missingFile ? 'Error' : test.passed ? 'Pass' : 'Fail';
  badge.className = 'case-status ' + (test.passed ? 'pass' : 'fail');
  const details = card.querySelector('details'); details.hidden = false; details.open = !test.passed;
  details.querySelector('pre').textContent = test.actual || '(empty output)';
  const log = details.querySelector('.case-log');
  log.textContent = [testRun.mode === 'file' ? test.console : '', test.error, test.truncated ? 'Output exceeded the display limit.' : ''].filter(Boolean).join('\n');
  log.hidden = !log.textContent;
  testRun.index++;
  if (testRun.index < testRun.cases.length) { runNextTestCase(); return; }
  const passed = testRun.cases.filter(test => test.passed).length;
  const summary = `${passed} / ${testRun.cases.length} passed`;
  testRun = null;
  setBusy(false);
  $('test-summary').textContent = summary;
  $('status').textContent = summary;
}
function abortTests(reason) {
  if (!testRun) return;
  Array.from($('test-cases').children).slice(testRun.index).forEach((card, index) => {
    card.querySelector('.case-status').textContent = index === 0 ? reason : 'Not run';
  });
  testRun = null;
  $('test-summary').textContent = reason;
}
$('add-case').onclick = () => {
  const mode = $('io-mode').value;
  testCases[mode].push({input:'', expected:''}); saveTests(); renderTestCases();
  $('test-cases').lastElementChild.querySelector('textarea').focus();
};
try {
  const savedMode = localStorage.getItem('python-editor-io-mode');
  if (['console', 'predefined', 'file'].includes(savedMode)) $('io-mode').value = savedMode;
} catch {}
$('io-mode').addEventListener('change', () => {
  try { localStorage.setItem('python-editor-io-mode', $('io-mode').value); }
  catch { $('status').textContent = 'Unable to save the selected mode locally.'; }
  updateIOMode();
});
updateIOMode();
