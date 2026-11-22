'use strict';
const $ = id => document.getElementById(id);
const STORAGE_KEY = 'html-terminal-project-v1';
const LANGUAGES = ['html', 'css', 'javascript'];
const DEFAULTS = {
  html:'<html>\n<head>\n  <title>My first page</title>\n</head>\n<body>\n  <h1>Hello!</h1>\n  <p>This is my page.</p>\n</body>\n</html>',
  css:'',
  javascript:'', active:'html', viewport:'responsive', split:50,
};
let project = {...DEFAULTS}, editor = null, models = {}, active = 'html';
let previewTimer, previewToken = '', consoleLines = 0, saveError = false;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved) {
    for (const language of LANGUAGES) if (typeof saved[language] === 'string') project[language] = saved[language];
    if (LANGUAGES.includes(saved.active)) project.active = saved.active;
    if (['responsive','tablet','mobile'].includes(saved.viewport)) project.viewport = saved.viewport;
    if (Number.isFinite(saved.split)) project.split = Math.max(25, Math.min(75, saved.split));
  }
} catch { saveError = true; }
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : ''; }
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); saveError = false; status('Saved.'); }
  catch { saveError = true; status('Could not save locally. Download your project to keep a copy.', true); }
}
function readCode() { return editor ? editor.getValue() : $('code').value; }
function changed() {
  project[active] = readCode(); persist();
  clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, 300);
}
function switchLanguage(language, focus = true) {
  if (!LANGUAGES.includes(language)) return;
  project[active] = readCode(); active = project.active = language;
  for (const name of LANGUAGES) {
    $(`${name}-tab`).setAttribute('aria-selected', String(name === active));
    $(`${name}-tab`).tabIndex = name === active ? 0 : -1;
  }
  $('editor-panel').setAttribute('aria-labelledby', `${active}-tab`);
  $('code').setAttribute('aria-label', `${active === 'javascript' ? 'JavaScript' : active.toUpperCase()} code`);
  if (editor) {
    if (editor.getModel()) viewStates[editor.getModel().getLanguageId()] = editor.saveViewState();
    editor.setModel(models[active]);
    if (viewStates[active]) editor.restoreViewState(viewStates[active]);
    editor.updateOptions({ariaLabel: $('code').getAttribute('aria-label')});
    if (focus) editor.focus();
  } else { $('code').value = project[active]; if (focus) $('code').focus(); }
  persist();
}
const viewStates = {};
for (const language of LANGUAGES) {
  const tab = $(`${language}-tab`);
  tab.onclick = () => switchLanguage(language);
  tab.onkeydown = e => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const index = LANGUAGES.indexOf(language);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (index + (e.key === 'ArrowLeft' ? -1 : 1) + 3) % 3;
    switchLanguage(LANGUAGES[next], false); $(`${LANGUAGES[next]}-tab`).focus();
  };
}
$('code').oninput = changed;
$('code').onkeydown = e => {
  if (e.key === 'Tab') { e.preventDefault(); const input = e.target; input.setRangeText('  ', input.selectionStart, input.selectionEnd, 'end'); changed(); }
};
function clearConsole() { consoleLines = 0; $('console-output').replaceChildren(); $('console-count').textContent = ''; }
$('clear-console').onclick = clearConsole;
function previewBridge(token) {
  let previousTitle;
  const sendTitle = () => {
    if (document.title === previousTitle) return;
    previousTitle = document.title;
    parent.postMessage({type:'html-terminal-title', token, text:document.title}, '*');
  };
  new MutationObserver(sendTitle).observe(document.documentElement, {subtree:true,childList:true,characterData:true});
  document.addEventListener('DOMContentLoaded', sendTitle);
  sendTitle();
  const send = (level, args) => {
    const format = value => {
      try {
        if (value instanceof Error) return value.stack || value.message;
        if (typeof value === 'string') return value;
        if (value === undefined) return 'undefined';
        return JSON.stringify(value) ?? String(value);
      } catch { return String(value); }
    };
    parent.postMessage({type:'html-terminal-console', token, level, text:args.map(format).join(' ').slice(0,4000)}, '*');
  };
  for (const level of ['log','info','warn','error']) {
    const original = console[level].bind(console);
    console[level] = (...args) => { send(level,args); original(...args); };
  }
  window.addEventListener('error', e => { send('error', [e.message || 'Script failed to load.', e.lineno ? `Line ${e.lineno}:${e.colno}` : '']); });
  window.addEventListener('unhandledrejection', e => send('error', [e.reason]));
}
function buildDocument(forPreview = false) {
  const doc = new DOMParser().parseFromString(project.html, 'text/html');
  if (forPreview) setPreviewTitle(doc.title);
  if (!doc.querySelector('meta[charset]')) { const meta = doc.createElement('meta'); meta.setAttribute('charset','utf-8'); doc.head.prepend(meta); }
  if (!doc.querySelector('meta[name="viewport"]')) { const meta = doc.createElement('meta'); meta.name = 'viewport'; meta.content = 'width=device-width, initial-scale=1'; doc.head.append(meta); }
  if (forPreview) {
    const bridge = doc.createElement('script');
    bridge.textContent = `(${previewBridge.toString()})(${JSON.stringify(previewToken)});`;
    doc.head.prepend(bridge);
  }
  if (project.css) {
    const style = doc.createElement('style');
    style.textContent = project.css.replace(/<\/style/gi, '\\3C /style'); doc.head.append(style);
  }
  if (project.javascript) {
    const script = doc.createElement('script');
    script.textContent = project.javascript.replace(/<\/script/gi, '<\\/script') + '\n//# sourceURL=terminal.js\n'; doc.body.append(script);
  }
  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}
function renderPreview() {
  clearTimeout(previewTimer); project[active] = readCode();
  clearConsole(); previewToken = crypto.randomUUID ? crypto.randomUUID() : String(Math.random());
  $('preview').srcdoc = buildDocument(true);
}
$('refresh').onclick = () => { persist(); renderPreview(); };
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('refresh').click(); } });
function setPreviewTitle(text) {
  const title = text.trim().slice(0,1000) || 'Untitled';
  $('preview-title').textContent = title; $('preview-title').title = title;
}
window.addEventListener('message', e => {
  if (e.source !== $('preview').contentWindow || e.data?.token !== previewToken || typeof e.data.text !== 'string') return;
  if (e.data.type === 'html-terminal-title') { setPreviewTitle(e.data.text); return; }
  if (e.data.type !== 'html-terminal-console' || consoleLines >= 200) return;
  const level = ['error','warn','info','log'].includes(e.data.level) ? e.data.level : 'log';
  const line = document.createElement('div'); line.className = `console-entry ${level}`; line.textContent = e.data.text.slice(0,4000); $('console-output').append(line);
  consoleLines++; $('console-count').textContent = String(consoleLines);
  if (level === 'error') $('console-panel').open = true;
});
function resizePreview() {
  const stage = $('preview-stage');
  const width = project.viewport === 'tablet' ? 768 : project.viewport === 'mobile' ? 390 : stage.clientWidth;
  const scale = Math.min(1, stage.clientWidth / Math.max(1,width));
  const device = $('preview-device');
  device.style.width = width + 'px'; device.style.height = stage.clientHeight / Math.max(.01,scale) + 'px';
  device.style.transform = `scale(${scale})`; device.style.left = Math.max(0,(stage.clientWidth-width*scale)/2) + 'px';
}
$('viewport').value = project.viewport;
$('viewport').onchange = e => { project.viewport = e.target.value; persist(); resizePreview(); };
new ResizeObserver(resizePreview).observe($('preview-stage'));
const verticalLayout = matchMedia('(max-width:760px)');
function updateSplit(value, save = false) {
  project.split = Math.max(25,Math.min(75,value));
  $('workspace').style.setProperty('--split', project.split + '%');
  $('splitter').setAttribute('aria-valuenow', String(Math.round(project.split)));
  $('splitter').setAttribute('aria-orientation', verticalLayout.matches ? 'horizontal' : 'vertical');
  if (save) persist();
}
verticalLayout.addEventListener('change', () => updateSplit(project.split));
updateSplit(project.split);
$('splitter').onpointerdown = e => {
  if (e.button !== 0) return;
  e.preventDefault(); const handle = $('splitter'); handle.setPointerCapture(e.pointerId); $('workspace').classList.add('resizing');
  handle.onpointermove = move => {
    const bounds = $('workspace').getBoundingClientRect();
    updateSplit(verticalLayout.matches ? (move.clientY-bounds.top)/bounds.height*100 : (move.clientX-bounds.left)/bounds.width*100);
  };
  const finish = () => {
    $('workspace').classList.remove('resizing');
    handle.onpointermove = handle.onpointerup = handle.onpointercancel = handle.onlostpointercapture = null;
    if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
    persist();
  };
  handle.onpointerup = handle.onpointercancel = handle.onlostpointercapture = finish;
};
$('splitter').onkeydown = e => {
  const previous = verticalLayout.matches ? 'ArrowUp' : 'ArrowLeft', next = verticalLayout.matches ? 'ArrowDown' : 'ArrowRight';
  if (![previous,next,'Home','End'].includes(e.key)) return;
  e.preventDefault(); updateSplit(e.key === 'Home' ? 25 : e.key === 'End' ? 75 : project.split + (e.key === previous ? -2 : 2),true);
};
function closeMenu(focus = false) { $('project-menu').hidden = true; $('menu-toggle').setAttribute('aria-expanded','false'); if (focus) $('menu-toggle').focus(); }
function openMenu(focus = false) { $('project-menu').hidden = false; $('menu-toggle').setAttribute('aria-expanded','true'); if (focus) $('open').focus(); }
$('menu-toggle').onclick = () => $('project-menu').hidden ? openMenu() : closeMenu();
$('menu-toggle').onkeydown = e => { if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(true); } };
$('project-menu').onclick = e => { if (e.target.closest('button')) closeMenu(); };
$('menu-wrap').onkeydown = e => {
  if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
  if (e.key === 'Tab') closeMenu();
  if (e.target === $('menu-toggle') || !['ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
  e.preventDefault(); const buttons = [...$('project-menu').querySelectorAll('button')], index = buttons.indexOf(document.activeElement);
  buttons[e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length-1 : (index+(e.key === 'ArrowUp' ? -1 : 1)+buttons.length)%buttons.length].focus();
};
document.addEventListener('click', e => { if (!$('menu-wrap').contains(e.target)) closeMenu(); });
function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text],{type})), link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
$('download').onclick = () => { project[active] = readCode(); download('index.html',buildDocument(),'text/html;charset=utf-8'); };
$('download-project').onclick = () => { project[active] = readCode(); download('project.json',JSON.stringify({format:'html-terminal',version:1,...project},null,2),'application/json'); };
function replaceProject(next, language) {
  clearTimeout(previewTimer);
  if (editor) {
    // Per-model listeners save after edits, so suppress them until all models are replaced.
    replacing = true;
    try { for (const name of LANGUAGES) models[name].setValue(next[name]); }
    finally { replacing = false; }
  }
  project = {...project,...next};
  if (!editor) $('code').value = project[active];
  switchLanguage(language || active); persist(); renderPreview();
}
let replacing = false;
$('open').onclick = () => $('file').click();
$('file').onchange = async () => {
  const file = $('file').files[0]; $('file').value = ''; if (!file) return;
  try {
    const text = await file.text(), extension = file.name.split('.').pop().toLowerCase();
    project[active] = readCode();
    let next = {...project}, language;
    if (extension === 'json') {
      const data = JSON.parse(text);
      if (data.format !== 'html-terminal' || data.version !== 1 || LANGUAGES.some(name => typeof data[name] !== 'string')) throw Error('Choose an HTML Terminal project file.');
      for (const name of LANGUAGES) next[name] = data[name];
      language = LANGUAGES.includes(data.active) ? data.active : 'html';
    } else if (extension === 'html' || extension === 'htm') { next = {...next,html:text,css:'',javascript:''}; language = 'html'; }
    else if (extension === 'css' || extension === 'js') { language = extension === 'css' ? 'css' : 'javascript'; next[language] = text; }
    else throw Error('Choose an HTML, CSS, JavaScript, or project JSON file.');
    replaceProject(next,language);
  } catch (error) { status(error.message,true); }
};
$('reset').onclick = () => {
  if (!confirm('Clear all HTML, CSS, and JavaScript? This cannot be undone.')) return;
  replaceProject({html:'',css:'',javascript:''},'html'); clearConsole();
};
// Textarea remains usable if the enhanced editor cannot load.
$('code').value = project.html;
switchLanguage(project.active,false); renderPreview(); resizePreview();
if (saveError) status('Could not read or save local data. Download your project to keep a copy.',true);
const loader = document.createElement('script'); loader.src = 'vendor/monaco/vs/loader.js';
let editorTimeout;
function fallbackEditor() { clearTimeout(editorTimeout); $('editor-status').textContent = 'Basic editor'; }
loader.onerror = fallbackEditor;
loader.onload = () => {
  window.MonacoEnvironment = {getWorkerUrl:() => new URL('editor-worker.js',location.href).href};
  window.require.config({paths:{vs:'vendor/monaco/vs'}});
  window.require(['vs/editor/editor.main'], () => {
    try {
      clearTimeout(editorTimeout);
      if (window.emmetMonaco) { emmetMonaco.emmetHTML(monaco); emmetMonaco.emmetCSS(monaco); }
      for (const language of LANGUAGES) models[language] = monaco.editor.createModel(project[language],language,monaco.Uri.parse(`file:///project/${language === 'javascript' ? 'script.js' : language === 'css' ? 'style.css' : 'index.html'}`));
      $('monaco').hidden = false;
      editor = monaco.editor.create($('monaco'),{model:models[active],theme:'vs-dark',automaticLayout:true,fontSize:15,lineHeight:25,fontFamily:'Menlo, Monaco, monospace',minimap:{enabled:false},tabSize:2,insertSpaces:true,padding:{top:16,bottom:16},scrollBeyondLastLine:false,lineNumbersMinChars:3,wordWrap:'on',occurrencesHighlight:'off',selectionHighlight:false,ariaLabel:$('code').getAttribute('aria-label'),tabCompletion:'on',quickSuggestions:true,unicodeHighlight:{ambiguousCharacters:false,invisibleCharacters:false,nonBasicASCII:false}});
      for (const language of LANGUAGES) models[language].onDidChangeContent(() => { if (!replacing) { project[language] = models[language].getValue(); if (language === active) changed(); } });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => $('refresh').click());
      $('code').hidden = true; $('editor-status').textContent = '';
    } catch { editor?.dispose(); editor = null; $('monaco').hidden = true; $('code').hidden = false; $('code').value = project[active]; fallbackEditor(); }
  },fallbackEditor);
};
editorTimeout = setTimeout(fallbackEditor,12000); document.head.append(loader);
