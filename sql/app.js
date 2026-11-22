'use strict';
const $ = id => document.getElementById(id);
const KEY = 'sql-terminal-database-v1';
const DRAFT_KEY = 'sql-terminal-data-drafts-v1';
let databaseTag = '';
const ORDER_KEY = 'sql-terminal-column-order-v1';
let columnOrders = Object.create(null);
try { columnOrders = Object.assign(Object.create(null), JSON.parse(localStorage.getItem(ORDER_KEY)) || {}); } catch {}
const TYPES = ['INTEGER', 'REAL', 'VARCHAR', 'TEXT', 'DATE', 'BOOLEAN'];
let SQL, db, selected = '', original = [], worker = null;
let workerOperation = 'query';
let activeView = 'tables';
const dataDrafts = new Map();
let uniqueGroups = [], originalUnique = [], originalPrimary = [];
const quote = name => '"' + name.replaceAll('"', '""') + '"';
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function status(message, error = false) { $('status').textContent = message; $('status').className = error ? 'error' : ''; }
function storageTag(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return `${text.length}:${hash >>> 0}`;
}
function persistDataDrafts() {
  try {
    const entries = [...dataDrafts].filter(([, draft]) => hasDataChanges(draft)).map(([name, draft]) => [name, {
      ...draft, editingRow:undefined, keys:undefined,
    }]);
    localStorage.setItem(DRAFT_KEY, JSON.stringify({databaseTag, entries}, (key, value) => {
      if (value instanceof Map) return {kind:'sql-map', values:[...value]};
      if (value instanceof Uint8Array) return {kind:'sql-bytes', values:[...value]};
      return value;
    }));
  } catch (error) { status('Could not save unfinished table edits locally: ' + error.message, true); }
}
function restoreDataDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY), (key, value) => {
      if (value?.kind === 'sql-map') return new Map(value.values);
      if (value?.kind === 'sql-bytes') return new Uint8Array(value.values);
      return value;
    });
    if (saved?.databaseTag !== databaseTag) return;
    const tables = rows("SELECT name FROM sqlite_schema WHERE type='table'").flat();
    for (const [name, draft] of saved.entries) {
      if (!tables.includes(name)) continue;
      draft.keys = draft.fields.filter(f => f.pk);
      dataDrafts.set(name, draft);
    }
  } catch (error) { status('Could not restore unfinished table edits: ' + error.message, true); }
}
function exportDatabase() {
  const bytes = db.export();
  db.run('PRAGMA foreign_keys=ON');
  return bytes;
}
function save() {
  try {
    const bytes = exportDatabase();
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const encoded = btoa(binary);
    localStorage.setItem(KEY, encoded);
    databaseTag = storageTag(encoded);
    status('Database saved.');
    persistDataDrafts();
  } catch (error) { status('Changes are in memory, but could not be saved: ' + error.message, true); }
}
function rows(sql) { return db.exec(sql)[0]?.values || []; }
function schema() {
  const columns = rows(`PRAGMA table_info(${quote(selected)})`);
  const tableSql = rows(`SELECT sql FROM sqlite_schema WHERE type='table' AND name='${selected.replaceAll("'", "''")}'`)[0]?.[0] || '';
  const auto = /\bAUTOINCREMENT\b/i.test(tableSql);
  const singleIntegerKey = columns.filter(r => r[5]).length === 1;
  const fields = columns.map(r => ({name:r[1], type:r[2], required:!!r[3] || !!r[5], default:r[4], pk:!!r[5], auto:auto && !!r[5], generated:singleIntegerKey && !!r[5] && r[2].toUpperCase() === 'INTEGER' && !/\bWITHOUT\s+ROWID\b/i.test(tableSql)}));
  const order = Array.isArray(columnOrders[selected]) ? columnOrders[selected] : [];
  const rank = name => order.includes(name) ? order.indexOf(name) : order.length;
  return fields.sort((a, b) => rank(a.name) - rank(b.name));
}
function renderTable(columns, values) {
  const table = node('table');
  const head = node('tr');
  columns.forEach(c => head.append(node('th', c)));
  const thead = node('thead'); thead.append(head); table.append(thead);
  const body = node('tbody');
  values.forEach(row => {
    const tr = node('tr');
    row.forEach(v => tr.append(node('td', v === null ? 'NULL' : v instanceof Uint8Array ? `[BLOB: ${v.length} bytes]` : String(v), v === null ? 'null' : '')));
    body.append(tr);
  });
  table.append(body); return table;
}
function hasDataChanges(draft) { return !!draft?.rows.some(row => row.changes.size); }
function loadDataDraft() {
  const fields = schema();
  const sql = rows(`SELECT sql FROM sqlite_schema WHERE type='table' AND name='${selected.replaceAll("'", "''")}'`)[0]?.[0] || '';
  const withoutRowid = /\bWITHOUT\s+ROWID\b/i.test(sql);
  const rowid = withoutRowid ? null : ['rowid', '_rowid_', 'oid'].find(name => !fields.some(f => f.name.toLowerCase() === name));
  const keys = fields.filter(f => f.pk);
  const columns = fields.map(f => quote(f.name)).join(', ');
  const result = rows(`SELECT ${rowid ? `${quote(rowid)}, ` : ''}${columns} FROM ${quote(selected)} LIMIT 500`);
  const draft = {fields, rowid, keys, error:'', count:rows(`SELECT count(*) FROM ${quote(selected)}`)[0][0], rows:result.map(values => ({
    original:rowid ? values.slice(1) : values,
    identity:rowid ? values[0] : null,
    changes:new Map(), isNew:false,
  }))};
  draft.rows.push(blankDataRow());
  dataDrafts.set(selected, draft);
  return draft;
}
function blankDataRow() { return {original:[], changes:new Map(), isNew:true}; }
function updateDataButtons(draft) {
  const dirty = hasDataChanges(draft);
  $('save-data').disabled = $('reset-data').disabled = !!worker || !dirty;
  $('add-data-row').disabled = !!worker;
  updateRowSelection(draft);
}
function updateRowSelection(draft) {
  const saved = draft.rows.filter(row => !row.isNew);
  const chosen = saved.filter(row => row.selected);
  $('delete-selected').textContent = chosen.length ? `Delete selected (${chosen.length})` : 'Delete selected';
  $('delete-selected').disabled = !!worker || !chosen.length;
  const all = $('table-data').querySelector('.select-all-rows');
  if (all) { all.checked = !!saved.length && chosen.length === saved.length; all.indeterminate = chosen.length > 0 && chosen.length < saved.length; }
  $('table-data').querySelectorAll('tbody tr').forEach((tr,index) => {
    const row = draft.rows[index];
    tr.classList.toggle('selected-row', !!row.selected);
    const checkbox = tr.querySelector('.row-select');
    if (checkbox) checkbox.checked = !!row.selected;
  });
}
function renderDataGrid() {
  const draft = dataDrafts.get(selected) || loadDataDraft();
  $('table-info').textContent = `${draft.count} ${draft.count === 1 ? 'row' : 'rows'}${draft.count > 500 ? ' · Showing first 500 rows' : ''}`;
  $('data-error').textContent = draft.error;
  const table = node('table', undefined, 'editable-data');
  const head = node('tr');
  const selectionHead = node('th', undefined, 'selection-cell');
  const selectAll = node('input'); selectAll.type = 'checkbox'; selectAll.className = 'select-all-rows';
  selectAll.setAttribute('aria-label', 'Select all displayed rows');
  selectAll.disabled = !!worker || !draft.rows.some(row => !row.isNew) || (!draft.rowid && !draft.keys.length);
  selectAll.onchange = () => { draft.rows.forEach(row => { if (!row.isNew) row.selected = selectAll.checked; }); updateRowSelection(draft); };
  selectionHead.append(selectAll); head.append(selectionHead);
  draft.fields.forEach(f => { const th = node('th', f.name); th.append(node('small', f.type)); head.append(th); });
  const thead = node('thead'); thead.append(head); table.append(thead);
  const body = node('tbody');
  const scrollTop = $('table-data').scrollTop, scrollLeft = $('table-data').scrollLeft;
  const activateRow = (row, column = 0) => {
    draft.editingRow = row?.isNew ? null : row;
    renderDataGrid();
    const target = $('table-data').querySelectorAll('tbody tr')[draft.rows.indexOf(row)];
    (target?.querySelectorAll('[data-column]')[column] || target?.querySelector('[data-column]'))?.focus({preventScroll:true});
  };
  draft.rows.forEach((row, index) => {
    const tr = node('tr'); tr.classList.toggle('new-row', row.isNew);
    const editing = row.isNew || draft.editingRow === row;
    const canEdit = !worker && (row.isNew || draft.rowid || draft.keys.length);
    tr.classList.toggle('editing-row', !row.isNew && editing);
    tr.classList.toggle('readonly-row', !row.isNew && !editing);
    if (!row.isNew && !editing && canEdit) {
      tr.tabIndex = 0;
      tr.title = 'Click to edit';
      tr.setAttribute('aria-label', `Row ${index + 1}. Press Enter to edit.`);
    }
    tr.onclick = e => {
      if (!canEdit || (row.isNew ? !draft.editingRow : draft.editingRow === row)) return;
      const column = Number(e.target.closest('td')?.dataset.columnIndex || 0);
      activateRow(row, column);
    };
    tr.onkeydown = e => {
      if (!canEdit) return;
      if (!editing && ['Enter', 'F2'].includes(e.key)) { e.preventDefault(); activateRow(row); }
      if (!row.isNew && editing && e.key === 'Escape') {
        e.preventDefault(); draft.editingRow = null; renderDataGrid();
        $('table-data').querySelectorAll('tbody tr')[index]?.focus({preventScroll:true});
      }
    };
    const selectionCell = node('td', undefined, 'selection-cell');
    selectionCell.onclick = e => e.stopPropagation();
    selectionCell.onkeydown = e => e.stopPropagation();
    if (!row.isNew) {
      const checkbox = node('input'); checkbox.type = 'checkbox'; checkbox.className = 'row-select';
      checkbox.setAttribute('aria-label', `Select row ${index + 1}`); checkbox.disabled = !canEdit;
      checkbox.onchange = () => { row.selected = checkbox.checked; updateRowSelection(draft); };
      selectionCell.append(checkbox);
    }
    tr.append(selectionCell);
    draft.fields.forEach((field, column) => {
      const td = node('td');
      const value = row.changes.has(column) ? row.changes.get(column) : row.isNew ? null : row.original[column];
      const isBlob = value instanceof Uint8Array;
      td.dataset.columnIndex = column;
      if (!editing) {
        td.textContent = value === null ? 'NULL' : isBlob ? `[BLOB: ${value.length} bytes]` : /BOOL/i.test(field.type) && [0, 1].includes(value) ? (value ? 'True' : 'False') : String(value);
        td.classList.toggle('null', value === null);
        td.classList.toggle('changed', row.changes.has(column));
        tr.append(td); return;
      }
      let input;
      if (/BOOL/i.test(field.type) && (value === null || ['0', '1'].includes(String(value)))) {
        input = node('select'); input.add(new Option('True', '1')); input.add(new Option('False', '0')); input.add(new Option('', ''));
      } else { input = node('input'); input.type = 'text'; }
      input.value = value === null ? '' : isBlob ? `[BLOB: ${value.length} bytes]` : String(value);
      input.setAttribute('aria-label', `${field.name}, row ${index + 1}`);
      input.dataset.column = field.name;
      const auto = row.isNew && field.generated;
      input.placeholder = auto ? 'Auto' : row.isNew && field.default !== null ? `Default: ${field.default}` : value === null && (!field.required || !row.isNew) ? 'NULL' : '';
      input.disabled = !!worker || isBlob || (!row.isNew && !draft.rowid && !draft.keys.length);
      const length = /^VARCHAR\s*\((\d+)\)$/i.exec(field.type);
      if (length) input.maxLength = Number(length[1]);
      const nullLabel = node('label', undefined, 'cell-null');
      const nullInput = node('input'); nullInput.type = 'checkbox'; nullInput.checked = value === null;
      if (row.isNew && field.required && !auto) nullInput.checked = false;
      nullInput.setAttribute('aria-label', `${auto ? 'Auto' : 'NULL'} for ${field.name}, row ${index + 1}`);
      nullInput.disabled = input.disabled || (field.required && !auto);
      const change = () => {
        const next = nullInput.checked ? null : input.value;
        if (!row.isNew && (next === null ? row.original[column] === null : row.original[column] !== null && String(row.original[column]) === next)) row.changes.delete(column);
        else row.changes.set(column, next);
        td.classList.toggle('changed', row.changes.has(column));
        updateDataButtons(draft);
        persistDataDrafts();
      };
      input.oninput = () => { nullInput.checked = false; change(); };
      if (input.tagName === 'SELECT') input.onchange = input.oninput;
      nullInput.onchange = () => { if (nullInput.checked) { input.value = ''; input.placeholder = auto ? 'Auto' : 'NULL'; } change(); };
      nullLabel.append(nullInput, auto ? 'Auto' : 'NULL');
      td.classList.toggle('changed', row.changes.has(column));
      const editor = node('div', undefined, 'cell-editor');
      editor.append(input, nullLabel);
      td.append(editor); tr.append(td);
    });
    body.append(tr);
  });
  table.append(body); $('table-data').replaceChildren(table);
  $('table-data').scrollTop = scrollTop; $('table-data').scrollLeft = scrollLeft;
  updateDataButtons(draft);
}
function dataValue(field, value) {
  if (value === null) return null;
  if (/INT|REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL|BOOL/i.test(field.type)) {
    if (!String(value).trim() || !Number.isFinite(Number(value))) throw Error(`Enter a number for ${field.name}, or select NULL.`);
    if (/INT/i.test(field.type) && !Number.isInteger(Number(value))) throw Error(`${field.name} must be a whole number.`);
    return Number(value);
  }
  return value;
}
$('add-data-row').onclick = () => {
  const draft = dataDrafts.get(selected); draft.editingRow = null; draft.rows.push(blankDataRow()); renderDataGrid();
  $('table-data').lastElementChild.querySelector('tbody tr:last-child [data-column]')?.focus();
};
$('delete-selected').onclick = () => {
  if (worker || !selected) return;
  const draft = dataDrafts.get(selected), chosen = draft?.rows.filter(row => !row.isNew && row.selected) || [];
  if (!chosen.length) return;
  if ([...dataDrafts].some(([name, data]) => data.rows.some(row => row.changes.size && (name !== selected || !row.selected)))) {
    status('Save or reset other unfinished edits before deleting selected rows.', true); return;
  }
  if (!confirm(`Delete ${chosen.length} selected ${chosen.length === 1 ? 'row' : 'rows'} from "${selected}"? Their unfinished edits will also be discarded. Related rows follow foreign-key rules.`)) return;
  try {
    db.run('BEGIN');
    for (const row of chosen) {
      const keys = draft.rowid ? [draft.rowid] : draft.keys.map(f => f.name);
      const values = draft.rowid ? [row.identity] : draft.keys.map(f => row.original[draft.fields.indexOf(f)]);
      if (!keys.length) throw Error('This table has no usable row identifier. Use Query to delete rows.');
      db.run(`DELETE FROM ${quote(selected)} WHERE ${keys.map(key => `${quote(key)} IS ?`).join(' AND ')}`, values);
      if (db.getRowsModified() !== 1) throw Error('A selected row changed since it was loaded. Reset and try again.');
    }
    db.run('COMMIT');
  } catch (error) {
    try { db.run('ROLLBACK'); } catch {}
    draft.error = error.message; $('data-error').textContent = error.message; return;
  }
  dataDrafts.clear(); save(); refresh();
};
$('reset-data').onclick = () => { dataDrafts.delete(selected); persistDataDrafts(); renderDataGrid(); };
$('data-form').onsubmit = e => {
  e.preventDefault();
  if (worker) return;
  const draft = dataDrafts.get(selected);
  if (!hasDataChanges(draft)) return;
  try {
    db.run('BEGIN');
    for (const row of draft.rows.filter(r => r.changes.size)) {
      const edits = [...row.changes];
      const values = edits.map(([column, value]) => dataValue(draft.fields[column], value));
      if (row.isNew) {
        db.run(`INSERT INTO ${quote(selected)} (${edits.map(([column]) => quote(draft.fields[column].name)).join(', ')}) VALUES (${edits.map(() => '?').join(', ')})`, values);
      } else {
        const keyColumns = draft.rowid ? [draft.rowid] : draft.keys.map(f => f.name);
        const keyValues = draft.rowid ? [row.identity] : draft.keys.map(f => row.original[draft.fields.indexOf(f)]);
        if (!keyColumns.length) throw Error('This table has no usable row identifier. Edit it using Query.');
        db.run(`UPDATE ${quote(selected)} SET ${edits.map(([column]) => `${quote(draft.fields[column].name)} = ?`).join(', ')} WHERE ${keyColumns.map(key => `${quote(key)} IS ?`).join(' AND ')}`, [...values, ...keyValues]);
        if (db.getRowsModified() !== 1) throw Error('The row changed since it was loaded. Reset and try again.');
      }
    }
    db.run('COMMIT');
    dataDrafts.delete(selected);
    for (const [name, other] of dataDrafts) if (!hasDataChanges(other)) dataDrafts.delete(name);
    save(); refresh();
  } catch (error) {
    try { db.run('ROLLBACK'); } catch {}
    draft.error = error.message; $('data-error').textContent = error.message;
  }
};
function refresh() {
  const tables = rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").flat();
  if (!tables.includes(selected)) selected = tables[0] || '';
  renderTabs(tables);
  $('generate-data').hidden = $('backup').hidden = !tables.length;
  $('delete-database').hidden = !tables.length;
  for (const id of ['edit-table', 'delete-table', 'table-info', 'table-data', 'data-actions']) $(id).hidden = !selected;
  $('tables-panel').classList.toggle('no-tables', !selected);
  $('edit-table').disabled = $('delete-table').disabled = !selected || !!worker;
  $('generate-data').disabled = $('delete-database').disabled = !tables.length || !!worker;
  $('table-data').replaceChildren();
  $('table-data').className = selected ? 'data' : 'data empty';
  if (!selected) {
    $('table-info').textContent = '';
    return;
  }
  renderDataGrid();
}
function renderTabs(tables) {
  const tabs = tables.map((name, index) => {
    const tab = node('button', name);
    tab.id = `table-tab-${index}`;
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'tables-panel');
    tab.setAttribute('aria-selected', activeView === 'tables' && name === selected);
    tab.tabIndex = activeView === 'tables' && name === selected ? 0 : -1;
    tab.onclick = () => { selected = name; activeView = 'tables'; refresh(); $(tab.id)?.focus(); };
    if (name === selected) $('tables-panel').setAttribute('aria-labelledby', tab.id);
    return tab;
  });
  const query = node('button', 'Query'); query.id = 'query-tab'; query.type = 'button';
  query.setAttribute('role', 'tab'); query.setAttribute('aria-controls', 'query-panel');
  query.setAttribute('aria-selected', activeView === 'query' || !tables.length);
  query.tabIndex = activeView === 'query' || !tables.length ? 0 : -1;
  query.onclick = () => { activeView = 'query'; renderTabs(tables); $('query-tab').focus(); };
  tabs.push(query);
  $('workspace-tabs').replaceChildren(...tabs);
  $('tables-panel').hidden = activeView === 'query' || !tables.length;
  $('query-panel').hidden = activeView !== 'query' && !!tables.length;
  tabs.forEach((tab, index) => tab.onkeydown = e => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (index + (e.key === 'ArrowLeft' ? -1 : 1) + tabs.length) % tabs.length;
    tabs[next].click();
  });
}
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
function addDragHandle(row) {
  const handle = node('button', '⠿', 'drag-handle');
  handle.type = 'button';
  handle.setAttribute('aria-label', 'Move field');
  handle.title = 'Drag to reorder · Arrow Up / Down to move';
  const cell = node('td'); cell.append(handle); row.append(cell);
  handle.onkeydown = e => {
    if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const target = e.key === 'ArrowUp' ? row.previousElementSibling : row.nextElementSibling;
    if (target) {
      if (e.key === 'ArrowUp') target.before(row); else target.after(row);
      handle.focus();
    }
  };
  handle.onpointerdown = e => {
    if (e.button !== 0) return;
    e.preventDefault();
    row.classList.add('dragging');
    const moveRow = move => {
      const siblings = [...$('fields').children].filter(el => el !== row);
      const target = siblings.find(el => move.clientY < el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2);
      if (target && row.nextElementSibling !== target) target.before(row);
      else if (!target && $('fields').lastElementChild !== row) $('fields').append(row);
      const scroll = $('structure-dialog');
      const bounds = scroll.getBoundingClientRect();
      if (move.clientY < bounds.top + 50) scroll.scrollTop -= 20;
      if (move.clientY > bounds.bottom - 50) scroll.scrollTop += 20;
    };
    const end = () => {
      row.classList.remove('dragging');
      document.removeEventListener('pointermove', moveRow);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      handle.focus({preventScroll:true});
    };
    document.addEventListener('pointermove', moveRow);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
  };
}
function addField(field) {
  const tr = node('tr'); tr.dataset.original = field ? field.name : '';
  addDragHandle(tr);
  const name = node('input'); name.type = 'text'; name.required = true; name.value = field?.name || ''; name.setAttribute('aria-label', 'Field name');
  const varchar = /^VARCHAR\s*\((\d+)\)$/i.exec(field?.type || '');
  const existingType = varchar ? 'VARCHAR' : field?.type;
  const type = node('select'); [...new Set([...TYPES, ...(field ? [existingType] : [])])].forEach(t => type.add(new Option(t || 'Any', t))); type.value = existingType || 'TEXT'; type.setAttribute('aria-label', 'Field type');
  const length = node('input'); length.type = 'number'; length.min = '1'; length.max = '1000000'; length.step = '1'; length.value = varchar?.[1] || '255'; length.setAttribute('aria-label', 'Length');
  const nullable = node('input'); nullable.type = 'checkbox'; nullable.checked = !field?.required; nullable.setAttribute('aria-label', 'Allow NULL');
  const pk = node('input'); pk.type = 'checkbox'; pk.checked = !!field?.pk; pk.setAttribute('aria-label', 'Primary key');
  const auto = node('input'); auto.type = 'checkbox'; auto.checked = !!field?.auto; auto.setAttribute('aria-label', 'Auto increment');
  const sync = () => {
    length.hidden = type.value !== 'VARCHAR'; length.required = !length.hidden; length.disabled = !!field || length.hidden;
    if (pk.checked) nullable.checked = false;
    nullable.hidden = pk.checked;
    nullable.disabled = pk.checked;
    auto.hidden = !pk.checked;
    auto.disabled = !pk.checked || type.value !== 'INTEGER';
    if (auto.disabled) auto.checked = false;
  };
  tr.syncField = sync;
  type.onchange = pk.onchange = () => { sync(); syncPrimaryOptions(); };
  if (field) type.disabled = true;
  const remove = node('button', 'Remove'); remove.type = 'button'; remove.onclick = () => { tr.remove(); syncPrimaryOptions(); renderUniqueGroups(); };
  for (const el of [name, type, length, nullable, pk, auto, remove]) { const td = node('td'); td.append(el); tr.append(td); }
  name.oninput = renderUniqueGroups;
  $('fields').append(tr); sync(); renderUniqueGroups();
}
function syncPrimaryOptions() {
  const fields = [...$('fields').children];
  const count = fields.filter(row => row.querySelector('[aria-label="Primary key"]').checked).length;
  fields.forEach(row => {
    row.syncField();
    const auto = row.querySelector('[aria-label="Auto increment"]');
    if (count !== 1) { auto.checked = false; auto.disabled = true; }
  });
}
function readUniqueKeys() {
  return rows(`PRAGMA index_list(${quote(selected)})`).filter(r => r[2] && r[3] !== 'pk' && !r[4]).flatMap(r => {
    const columns = rows(`PRAGMA index_xinfo(${quote(r[1])})`).filter(c => c[5]);
    if (columns.some(c => c[1] < 0 || !original.some(f => f.name === c[2]))) return [];
    return [{source:r[1], origin:r[3], columns:columns.map(c => ({name:c[2], desc:!!c[3], collation:c[4]}))}];
  });
}
function renderUniqueGroups() {
  if (!$('unique-keys')) return;
  const fields = [...$('fields').children];
  $('unique-keys').replaceChildren();
  uniqueGroups.forEach((group, index) => {
    const section = node('div', undefined, 'unique-group');
    const choices = node('div', undefined, 'unique-choices');
    fields.forEach((row, fieldIndex) => {
      const label = node('label'), input = node('input'); input.type = 'checkbox';
      input.checked = group.rows.includes(row);
      input.setAttribute('aria-label', `Unique ${index + 1}: field ${fieldIndex + 1}`);
      input.onchange = () => { group.rows = fields.filter(fieldRow => fieldRow === row ? input.checked : group.rows.includes(fieldRow)); };
      label.append(input, row.querySelector('[aria-label="Field name"]').value || `Field ${fieldIndex + 1}`); choices.append(label);
    });
    const remove = node('button', 'Remove'); remove.type = 'button';
    remove.setAttribute('aria-label', `Remove unique key ${index + 1}`);
    remove.onclick = () => { uniqueGroups.splice(index, 1); renderUniqueGroups(); };
    section.append(choices, remove); $('unique-keys').append(section);
  });
}
$('add-unique').onclick = () => { uniqueGroups.push({rows:[]}); renderUniqueGroups(); };
$('data-types-help').onclick = () => {
  $('help-dialog').showModal();
  $('help-title').focus({preventScroll:true});
  $('help-dialog').scrollTop = 0;
};
function openStructure(edit) {
  if (edit && hasDataChanges(dataDrafts.get(selected))) { status('Save or reset this table’s edits before changing its structure.', true); return; }
  original = edit ? schema() : [];
  originalPrimary = edit ? rows(`PRAGMA table_info(${quote(selected)})`).filter(r => r[5]).sort((a,b) => a[5]-b[5]).map(r => r[1]) : [];
  originalUnique = edit ? readUniqueKeys() : [];
  uniqueGroups = [];
  $('structure-title').textContent = edit ? 'Edit structure' : 'New table';
  $('table-name').value = edit ? selected : '';
  $('fields').replaceChildren();
  if (edit) original.forEach(addField); else { addField();
    const row = $('fields').lastElementChild; row.querySelector('input').value = 'id'; row.querySelector('select').value = 'INTEGER'; row.querySelector('[aria-label="Primary key"]').checked = true; row.querySelector('select').dispatchEvent(new Event('change')); row.querySelector('[aria-label="Auto increment"]').checked = true;
    addField();
    const secondType = $('fields').lastElementChild.querySelector('select');
    secondType.value = 'VARCHAR';
    secondType.dispatchEvent(new Event('change'));
  }
  const fieldRows = [...$('fields').children];
  uniqueGroups = originalUnique.map(key => ({...key, rows:key.columns.map(c => fieldRows.find(row => row.dataset.original === c.name))}));
  syncPrimaryOptions(); renderUniqueGroups();
  $('structure-error').textContent = ''; $('structure-dialog').showModal();
}
function closeDatabaseMenu(focus = false) {
  $('database-menu').hidden = true;
  $('database-menu-toggle').setAttribute('aria-expanded', 'false');
  if (focus) $('database-menu-toggle').focus();
}
function openDatabaseMenu(focus = false) {
  $('database-menu').hidden = false;
  $('database-menu-toggle').setAttribute('aria-expanded', 'true');
  if (focus) $('database-menu').querySelector('button:not([hidden]):not(:disabled)')?.focus();
}
$('database-menu-toggle').onclick = () => $('database-menu').hidden ? openDatabaseMenu() : closeDatabaseMenu();
$('database-menu-toggle').onkeydown = e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault(); openDatabaseMenu(true);
    if (e.key === 'ArrowUp') [...$('database-menu').querySelectorAll('button:not([hidden]):not(:disabled)')].at(-1)?.focus();
  }
};
$('database-menu').onclick = e => { if (e.target.closest('button:not(:disabled)')) closeDatabaseMenu(); };
$('database-menu-wrap').onkeydown = e => {
  if (e.key === 'Escape') { e.preventDefault(); closeDatabaseMenu(true); }
  if (e.key === 'Tab') closeDatabaseMenu();
  if (e.target === $('database-menu-toggle')) return;
  if (!['ArrowDown','ArrowUp','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const buttons = [...$('database-menu').querySelectorAll('button:not([hidden]):not(:disabled)')];
  const index = buttons.indexOf(document.activeElement);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
};
document.addEventListener('click', e => { if (!$('database-menu-wrap').contains(e.target)) closeDatabaseMenu(); });
$('delete-database').onclick = () => {
  if (!db || worker) return;
  if (!confirm('Delete the entire database? All tables, data, and unfinished table edits will be removed. This cannot be undone.')) return;
  const empty = new SQL.Database(); empty.run('PRAGMA foreign_keys=ON');
  db.close(); db = empty;
  dataDrafts.clear(); columnOrders = Object.create(null); selected = ''; activeView = 'query';
  save();
  try { localStorage.removeItem(ORDER_KEY); } catch {}
  refresh();
  $('query-results').replaceChildren(node('p', 'Query results will appear here.', 'muted'));
  if (!$('status').classList.contains('error')) status('Database deleted.');
};
function databaseSqlDump() {
  const tables = rows("SELECT name, sql FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
  if (tables.some(([,sql]) => /^CREATE\s+VIRTUAL/i.test(sql))) throw Error('Virtual tables cannot be exported by this backup tool.');
  const dump = ['-- SQL Terminal backup', '-- Restore into an empty SQLite database.', 'PRAGMA foreign_keys=OFF;', 'BEGIN TRANSACTION;'];
  const statement = sql => sql.trim() + '\n;';
  for (const [,sql] of tables) dump.push(statement(sql));
  for (const [name, sql] of tables) {
    const fields = rows(`PRAGMA table_xinfo(${quote(name)})`);
    const columns = fields.filter(f => f[6] === 0).map(f => f[1]);
    if (!/\bWITHOUT\s+ROWID\b/i.test(sql)) {
      const rowid = ['rowid', '_rowid_', 'oid'].find(id => !fields.some(f => f[1].toLowerCase() === id));
      if (rowid) columns.unshift(rowid);
    }
    // Use SQLite's formatter to preserve 64-bit integers and binary values.
    // Text containing NUL needs a byte literal because quote() truncates it.
    const expressions = columns.map(name => {
      const column = quote(name);
      return `CASE WHEN typeof(${column})='text' AND instr(${column},char(0))>0 THEN 'CAST(X''' || hex(${column}) || ''' AS TEXT)' WHEN typeof(${column})='real' AND ${column}=9e999 THEN '9e999' WHEN typeof(${column})='real' AND ${column}=-9e999 THEN '-9e999' ELSE quote(${column}) END`;
    });
    const cursor = db.prepare(`SELECT ${expressions.join(', ')} FROM ${quote(name)}`);
    try {
      const prefix = `INSERT INTO ${quote(name)} (${columns.map(quote).join(', ')}) VALUES (`;
      while (cursor.step()) dump.push(prefix + cursor.get().join(', ') + ');');
    } finally { cursor.free(); }
  }
  if (rows("SELECT name FROM sqlite_schema WHERE name='sqlite_sequence'").length) {
    dump.push('DELETE FROM sqlite_sequence;');
    for (const [name, value] of rows('SELECT quote(name), quote(seq) FROM sqlite_sequence')) dump.push(`INSERT INTO sqlite_sequence(name,seq) VALUES(${name},${value});`);
  }
  for (const [sql] of rows("SELECT sql FROM sqlite_schema WHERE type IN ('index','view','trigger') AND sql IS NOT NULL ORDER BY CASE type WHEN 'index' THEN 0 WHEN 'view' THEN 1 ELSE 2 END, name")) dump.push(statement(sql));
  dump.push('COMMIT;', 'PRAGMA foreign_keys=ON;', '');
  return dump.join('\n');
}
$('backup').onclick = () => {
  if (!db || worker) return;
  if ([...dataDrafts.values()].some(hasDataChanges)) { status('Save or reset table edits before creating a backup.', true); return; }
  try {
    const url = URL.createObjectURL(new Blob([databaseSqlDump()], {type:'application/sql;charset=utf-8'}));
    const link = node('a'); link.href = url;
    const now = new Date(), pad = number => String(number).padStart(2, '0');
    link.download = `sql-terminal-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.sql`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('Backup downloaded.');
  } catch (error) { status('Could not create backup: ' + error.message, true); }
};
$('restore').onclick = () => { if (db && !worker) $('restore-file').click(); };
$('restore-file').onchange = () => {
  const file = $('restore-file').files[0];
  $('restore-file').value = '';
  if (!file || !db || worker) return;
  const hasTables = rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'").length;
  if ((hasTables || [...dataDrafts.values()].some(hasDataChanges)) && !confirm(`Restore "${file.name}"? This replaces all current tables and data, including unfinished edits.`)) return;
  const task = new Worker('query-worker.js');
  worker = task; workerOperation = 'restore'; activeView = 'query';
  busy(true); status('Restoring database…');
  const finish = data => {
    if (worker !== task) return;
    task.terminate(); worker = null; workerOperation = 'query';
    if (data.error) { busy(false); status('Restore failed. Current data was kept: ' + data.error, true); return; }
    let restored;
    try { restored = new SQL.Database(data.database); restored.run('PRAGMA foreign_keys=ON'); }
    catch (error) { restored?.close(); busy(false); status('Restore failed. Current data was kept: ' + error.message, true); return; }
    db.close(); db = restored;
    dataDrafts.clear(); columnOrders = Object.create(null); selected = ''; activeView = 'tables';
    save();
    try { localStorage.removeItem(ORDER_KEY); } catch {}
    busy(false);
    $('query-results').replaceChildren(node('p', 'Query results will appear here.', 'muted'));
    if (!$('status').classList.contains('error')) status('Database restored.');
  };
  task.onmessage = e => finish(e.data);
  task.onerror = e => finish({error:e.message || 'Unable to start restore worker.'});
  file.text().then(query => { if (worker === task) task.postMessage({restore:true, query}); }).catch(error => finish({error:error.message}));
};
$('new-table').onclick = () => openStructure(false);
$('generate-data').onclick = () => {
  if (!db || worker) return;
  if ([...dataDrafts.values()].some(hasDataChanges)) { status('Save or reset table edits before generating data.', true); return; }
  $('generate-error').textContent = '';
  const tables = rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").flat();
  $('generate-tables').replaceChildren();
  tables.forEach(table => {
    const tr = node('tr'), label = node('td', table);
    const references = [...new Set(rows(`PRAGMA foreign_key_list(${quote(table)})`).map(r => r[2]))];
    if (references.length) label.append(node('small', 'References: ' + references.join(', '), 'muted'));
    const count = node('input'); count.type = 'number'; count.min = '0'; count.max = '10000'; count.step = '1'; count.value = '10'; count.required = true;
    count.dataset.table = table; count.setAttribute('aria-label', `Rows to add to ${table}`);
    const cell = node('td'); cell.append(count);
    tr.append(label, node('td', String(rows(`SELECT count(*) FROM ${quote(table)}`)[0][0])), cell);
    $('generate-tables').append(tr);
  });
  $('generate-dialog').showModal();
  const first = $('generate-tables').querySelector('input'); first?.focus(); first?.select();
};
function finishGenerating() {
  $('generate-tables').querySelectorAll('input').forEach(input => input.disabled = false);
  $('generate-submit').disabled = false;
  $('generate-submit').textContent = 'Generate';
}
$('generate-dialog').addEventListener('close', () => {
  if (worker && workerOperation === 'generate') {
    worker.terminate(); worker = null; workerOperation = 'query'; busy(false);
    status('Generation cancelled. No rows were added.');
  }
  finishGenerating();
});
$('generate-form').onsubmit = e => {
  e.preventDefault(); if (worker || !db) return;
  const plan = [...$('generate-tables').querySelectorAll('input')].map(input => ({table:input.dataset.table, count:Number(input.value)}));
  if (plan.some(item => !Number.isInteger(item.count) || item.count < 0 || item.count > 10000)) { $('generate-error').textContent = 'Enter whole numbers from 0 to 10,000. Use 0 to skip a table.'; return; }
  if (!plan.some(item => item.count)) { $('generate-error').textContent = 'Choose at least one table with rows to add.'; return; }
  const task = new Worker('generate-worker.js'); worker = task; workerOperation = 'generate';
  busy(true); $('generate-tables').querySelectorAll('input').forEach(input => input.disabled = true); $('generate-submit').disabled = true;
  $('generate-submit').textContent = 'Generating…'; $('generate-error').textContent = '';
  status('Generating data…');
  const finish = data => {
    if (worker !== task) return;
    task.terminate(); worker = null; workerOperation = 'query'; finishGenerating();
    if (data.error) { busy(false); $('generate-error').textContent = data.error; status('Generation failed. Current data was kept.', true); return; }
    let generated;
    try { generated = new SQL.Database(data.database); generated.run('PRAGMA foreign_keys=ON'); }
    catch (error) { generated?.close(); busy(false); $('generate-error').textContent = error.message; return; }
    db.close(); db = generated; dataDrafts.clear(); activeView = 'tables';
    save(); busy(false); $('generate-dialog').close();
    if (!$('status').classList.contains('error')) status(`Added ${data.count} rows across ${data.tables} ${data.tables === 1 ? 'table' : 'tables'}.`);
  };
  task.onmessage = e => finish(e.data);
  task.onerror = e => finish({error:e.message || 'Unable to start data generator.'});
  task.postMessage({database:exportDatabase(), plan});
};
$('edit-table').onclick = () => openStructure(true);
$('delete-table').onclick = () => {
  if (!selected || worker) return;
  if ([...dataDrafts].some(([name, draft]) => name !== selected && hasDataChanges(draft))) {
    status('Save or reset edits in other tables before deleting this table.', true); return;
  }
  const name = selected;
  if (!confirm(`Delete table "${name}" and all its data? This also discards any unsaved edits to this table.`)) return;
  try {
    db.run('BEGIN');
    db.run(`DROP TABLE ${quote(name)}`);
    db.run('COMMIT');
  } catch (error) {
    try { db.run('ROLLBACK'); } catch {}
    status('Could not delete table: ' + error.message, true); return;
  }
  dataDrafts.clear();
  delete columnOrders[name];
  selected = ''; activeView = 'tables';
  save();
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(columnOrders)); } catch {}
  refresh();
};
$('add-field').onclick = () => addField();
// Tokenize definitions so quoted text, defaults and CHECK expressions remain intact.
function sqlTokens(sql) {
  return [...sql.matchAll(/--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|\[[^\]]*\]|[A-Za-z_][A-Za-z_0-9$]*|[^\s]/g)]
    .filter(match => !match[0].startsWith('--') && !match[0].startsWith('/*'))
    .map(match => ({text:match[0], start:match.index, end:match.index + match[0].length}));
}
function setColumnNullability(definition, required) {
  const tokens = sqlTokens(definition);
  let depth = 0;
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.text === '(') depth++;
    if (t.text === ')') depth--;
    if (!depth && t.text.toUpperCase() === 'NOT' && tokens[i + 1]?.text.toUpperCase() === 'NULL') {
      if (required) return definition;
      let start = t.start, end = tokens[i + 1].end;
      if (tokens[i - 2]?.text.toUpperCase() === 'CONSTRAINT') start = tokens[i - 2].start;
      if (tokens[i + 2]?.text.toUpperCase() === 'ON' && tokens[i + 3]?.text.toUpperCase() === 'CONFLICT') end = tokens[i + 4].end;
      return definition.slice(0, start) + definition.slice(end);
    }
  }
  return required ? definition + '\n NOT NULL' : definition;
}
function removeKeyDefinitions(definition, primary, unique) {
  const tokens = sqlTokens(definition);
  let first = tokens[0]?.text.toUpperCase();
  if (first === 'CONSTRAINT') first = tokens[2]?.text.toUpperCase();
  if ((primary && first === 'PRIMARY') || (unique && first === 'UNIQUE')) return null;
  let depth = 0, spans = [];
  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i], word = token.text.toUpperCase();
    if (word === '(') depth++;
    if (word === ')') depth--;
    const pk = primary && word === 'PRIMARY' && tokens[i+1]?.text.toUpperCase() === 'KEY';
    if (depth || (!pk && !(unique && word === 'UNIQUE'))) continue;
    let start = token.start, last = i + (pk ? 1 : 0);
    if (tokens[i-2]?.text.toUpperCase() === 'CONSTRAINT') start = tokens[i-2].start;
    if (pk && /^(ASC|DESC)$/i.test(tokens[last+1]?.text || '')) last++;
    if (tokens[last+1]?.text.toUpperCase() === 'ON' && tokens[last+2]?.text.toUpperCase() === 'CONFLICT') last += 3;
    if (pk && tokens[last+1]?.text.toUpperCase() === 'AUTOINCREMENT') last++;
    spans.push([start,tokens[last].end]); i = last;
  }
  for (const [start,end] of spans.reverse()) definition = definition.slice(0,start) + definition.slice(end);
  return definition;
}
function rebuildNullability(tableName, changed, keyChanges = null) {
  const createSql = rows(`SELECT sql FROM sqlite_schema WHERE type='table' AND name='${tableName.replaceAll("'", "''")}'`)[0][0];
  if (/^CREATE\s+VIRTUAL/i.test(createSql)) throw Error('Change this virtual table using Query.');
  const tokens = sqlTokens(createSql);
  const open = tokens.findIndex(t => t.text === '(');
  let depth = 1, start = tokens[open].end, end, definitions = [];
  for (const t of tokens.slice(open + 1)) {
    if (t.text === '(') depth++;
    if (t.text === ')') depth--;
    if (!depth || (depth === 1 && t.text === ',')) {
      definitions.push(createSql.slice(start, t.start)); start = t.end;
      if (!depth) { end = t.start; break; }
    }
  }
  const decode = value => value[0] === '[' ? value.slice(1, -1) : /["'`]/.test(value[0]) ? value.slice(1, -1).replaceAll(value[0] + value[0], value[0]) : value;
  definitions = definitions.flatMap(definition => {
    if (keyChanges) {
      definition = removeKeyDefinitions(definition, keyChanges.primaryChanged, keyChanges.uniqueChanged);
      if (definition === null) return [];
    }
    const first = sqlTokens(definition)[0];
    if (!first || /^(CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)$/i.test(first.text)) return definition;
    const change = changed.find(f => f.name.toLowerCase() === decode(first.text).toLowerCase());
    return change ? setColumnNullability(definition, change.required) : definition;
  });
  if (keyChanges?.primaryChanged && keyChanges.primary.length) {
    const primary = keyChanges.primary;
    if (primary[0].auto) {
      definitions = definitions.map(definition => decode(sqlTokens(definition)[0].text) === primary[0].name ? definition + '\n PRIMARY KEY AUTOINCREMENT' : definition);
    } else definitions.push(`PRIMARY KEY (${primary.map(f => quote(f.name)).join(', ')})`);
  }
  if (keyChanges?.uniqueChanged) keyChanges.unique.forEach(key => definitions.push(`UNIQUE (${key.columns.map(c => `${quote(c.name)}${c.collation ? ` COLLATE ${quote(c.collation)}` : ''}${c.desc ? ' DESC' : ''}`).join(', ')})`));
  if (keyChanges?.uniqueChanged && rows(`PRAGMA index_list(${quote(tableName)})`).some(r => r[3] === 'u' && !keyChanges.oldUnique.some(key => key.source === r[1]))) throw Error('Unique keys on generated fields must be changed using Query.');
  const excludedIndexes = keyChanges?.uniqueChanged ? keyChanges.oldUnique.filter(k => k.origin === 'c').map(k => k.source) : [];
  const objects = (db.exec("SELECT name, sql FROM sqlite_schema WHERE tbl_name=? AND type IN ('index','trigger') AND sql IS NOT NULL", [tableName])[0]?.values || []).filter(([name]) => !excludedIndexes.includes(name)).map(([,sql]) => sql);
  const columns = rows(`PRAGMA table_xinfo(${quote(tableName)})`);
  const copy = columns.filter(c => c[6] === 0).map(c => c[1]);
  if (!/\bWITHOUT\s+ROWID\b/i.test(createSql)) {
    const rowid = ['rowid', '_rowid_', 'oid'].find(name => !columns.some(c => c[1].toLowerCase() === name));
    if (rowid) copy.unshift(rowid);
    else if (!columns.some(c => c[5] && c[2].toUpperCase() === 'INTEGER')) throw Error('This table hides every row identifier. Change its structure using Query.');
  }
  const sequence = /\bAUTOINCREMENT\b/i.test(createSql) ? db.exec('SELECT seq FROM sqlite_sequence WHERE name=?', [tableName])[0]?.values[0][0] : null;
  const temp = '__sql_terminal_rebuild_' + Date.now();
  db.run(`CREATE TABLE ${quote(temp)} (${definitions.join(',')})${createSql.slice(end + 1)}`);
  const names = copy.map(quote).join(', ');
  db.run(`INSERT INTO ${quote(temp)} (${names}) SELECT ${names} FROM ${quote(tableName)}`);
  db.run(`DROP TABLE ${quote(tableName)}`);
  const legacy = rows('PRAGMA legacy_alter_table')[0][0];
  try {
    db.run('PRAGMA legacy_alter_table=ON');
    db.run(`ALTER TABLE ${quote(temp)} RENAME TO ${quote(tableName)}`);
  } finally { db.run(`PRAGMA legacy_alter_table=${legacy}`); }
  objects.forEach(sql => db.run(sql));
  if (sequence != null && (!keyChanges?.primaryChanged || keyChanges.primary.some(f => f.auto))) {
    db.run('UPDATE sqlite_sequence SET seq=max(seq, ?) WHERE name=?', [sequence, tableName]);
    if (!db.getRowsModified()) db.run('INSERT INTO sqlite_sequence(name,seq) VALUES(?,?)', [tableName, sequence]);
  }
}
$('structure-form').onsubmit = e => {
  e.preventDefault();
  const name = $('table-name').value.trim();
  const fields = [...$('fields').children].map(tr => { const els = tr.querySelectorAll('input,select'); return {old:tr.dataset.original, name:els[0].value.trim(), type:els[1].value, length:Number(els[2].value), required:!els[3].checked, pk:els[4].checked, auto:els[5].checked}; });
  try {
    if (!name || !fields.length || fields.some(f => !f.name)) throw Error('Enter a table name and at least one named field.');
    if (new Set(fields.map(f => f.name.toLowerCase())).size !== fields.length) throw Error('Field names must be unique.');
    const primary = fields.filter(f => f.pk);
    const oldPrimaryNames = originalPrimary.map(old => fields.find(f => f.old === old)?.name).filter(Boolean);
    const sameNames = (a,b) => a.length === b.length && a.every((name,index) => name === b[index]);
    const primaryChanged = !sameNames([...oldPrimaryNames].sort(), primary.map(f => f.name).sort()) || original.filter(f => f.pk).length !== primary.length || fields.some(f => f.old && !!original.find(old => old.name === f.old).auto !== f.auto);
    const unique = uniqueGroups.map(group => {
      const selectedRows = group.rows.filter(row => row.parentElement === $('fields'));
      if (!selectedRows.length) throw Error('Select at least one field for each unique key, or remove the empty key.');
      return {columns:selectedRows.map(row => {
        const f = fields[[...$('fields').children].indexOf(row)];
        const previous = group.columns?.find(c => c.name === f.old);
        return {...previous, name:f.name};
      })};
    });
    const oldUnique = originalUnique.map(key => ({...key, columns:key.columns.map(c => ({...c, name:fields.find(f => f.old === c.name)?.name}))}));
    const uniqueChanged = JSON.stringify(oldUnique.map(k => k.columns)) !== JSON.stringify(unique.map(k => k.columns));
    const uniqueSql = unique.map(key => `UNIQUE (${key.columns.map(c => `${quote(c.name)}${c.collation ? ` COLLATE ${quote(c.collation)}` : ''}${c.desc ? ' DESC' : ''}`).join(', ')})`);
    if (fields.some(f => f.type === 'VARCHAR' && (!Number.isInteger(f.length) || f.length < 1 || f.length > 1000000))) throw Error('VARCHAR length must be a whole number from 1 to 1,000,000.');
    if (fields.some(f => f.auto && (primary.length !== 1 || !f.pk || f.type !== 'INTEGER'))) throw Error('Auto increment needs exactly one primary key of type INTEGER.');
    const definition = f => `${quote(f.name)} ${f.type === 'VARCHAR' ? `VARCHAR(${f.length})` : f.type}${f.auto ? ' PRIMARY KEY AUTOINCREMENT' : ''}${f.required || f.pk ? ' NOT NULL' : ''}${f.type === 'VARCHAR' ? ` CHECK (length(${quote(f.name)}) <= ${f.length})` : ''}`;
    if (original.length) {
      const removed = original.filter(f => !fields.some(n => n.old === f.name));
      if (removed.length && !confirm('Delete these fields and all their data: ' + removed.map(f => f.name).join(', ') + '?')) return;
      const nullChanges = fields.filter(f => f.old && original.find(old => old.name === f.old).required !== f.required);
      const rebuildKeys = primaryChanged || uniqueChanged;
      if (nullChanges.length || rebuildKeys) db.run('PRAGMA foreign_keys=OFF');
      db.run('BEGIN');
      // Temporary names also allow swapping two field names safely.
      const rename = fields.filter(f => f.old && f.old !== f.name);
      const prefix = '__sql_terminal_' + Date.now() + '_';
      rename.forEach((f, i) => db.run(`ALTER TABLE ${quote(selected)} RENAME COLUMN ${quote(f.old)} TO ${quote(prefix + i)}`));
      removed.forEach(f => db.run(`ALTER TABLE ${quote(selected)} DROP COLUMN ${quote(f.name)}`));
      rename.forEach((f, i) => db.run(`ALTER TABLE ${quote(selected)} RENAME COLUMN ${quote(prefix + i)} TO ${quote(f.name)}`));
      fields.filter(f => !f.old).forEach(f => db.run(`ALTER TABLE ${quote(selected)} ADD COLUMN ${definition({...f, pk:false, auto:false})}`));
      if (nullChanges.length || rebuildKeys) {
        const requiredChanges = [...nullChanges, ...fields.filter(f => f.pk && !nullChanges.includes(f))];
        rebuildNullability(selected, requiredChanges, {primaryChanged, primary, uniqueChanged, unique, oldUnique:originalUnique});
        if (rows('PRAGMA foreign_key_check').length) throw Error('This change would violate a foreign key constraint.');
      }
      // Restore normal ALTER TABLE reference updates before a table rename.
      if (name !== selected) db.run(`ALTER TABLE ${quote(selected)} RENAME TO ${quote(name)}`);
      db.run('COMMIT');
    } else {
      db.run(`CREATE TABLE ${quote(name)} (${[...fields.map(definition), ...(primary.length && !fields.some(f => f.auto) ? [`PRIMARY KEY (${primary.map(f => quote(f.name)).join(', ')})`] : []), ...uniqueSql].join(', ')})`);
    }
    const previousName = selected;
    dataDrafts.delete(name);
    if (original.length) dataDrafts.delete(previousName);
    selected = name; activeView = 'tables';
    if (original.length && previousName !== name) delete columnOrders[previousName];
    columnOrders[name] = fields.map(f => f.name);
    save();
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(columnOrders)); }
    catch { status('Table saved, but column order could not be saved in this browser.', true); }
    refresh(); $('structure-dialog').close();
  } catch (error) { try { db.run('ROLLBACK'); } catch {} $('structure-error').textContent = error.message; }
  finally { db.run('PRAGMA foreign_keys=ON'); }
};
function busy(value) {
  $('run').disabled = $('new-table').disabled = $('backup').disabled = $('restore').disabled = $('database-menu-toggle').disabled = value;
  if (value) closeDatabaseMenu();
  $('stop').disabled = !value;
  refresh();
}
$('run').onclick = () => {
  if (worker || !db || !$('query').value.trim()) return;
  if ([...dataDrafts.values()].some(hasDataChanges)) { status('Save or reset table edits before running SQL.', true); return; }
  const start = performance.now();
  workerOperation = 'query'; worker = new Worker('query-worker.js'); busy(true); status('Running query…'); $('query-results').replaceChildren(node('p', 'Running…', 'muted'));
  const finish = data => {
    worker.terminate(); worker = null;
    if (data.database) { dataDrafts.clear(); db.close(); db = new SQL.Database(data.database); db.run('PRAGMA foreign_keys=ON'); save(); }
    busy(false); $('query-results').replaceChildren();
    if (data.error) { $('query-results').append(node('p', data.error, 'error')); status('Query failed. Earlier completed statements may have changed the database.', true); }
    else {
      for (const result of data.results) {
        const section = node('section', undefined, 'result');
        if (result.columns.length) { section.append(node('p', `${result.values.length} rows${result.truncated ? ' · Showing first 1,000 rows' : ''}`, 'muted')); const scroll = node('div', undefined, 'scroll'); scroll.append(renderTable(result.columns, result.values)); section.append(scroll); }
        else section.append(node('p', `Statement completed · ${result.changes} rows changed`, 'muted'));
        $('query-results').append(section);
      }
      if (!data.results.length) $('query-results').append(node('p', 'No statements to run.', 'muted'));
      // Keep a storage warning visible if persistence failed.
      if (!$('status').classList.contains('error')) status(`Completed in ${Math.round(performance.now() - start)} ms.`);
    }
  };
  worker.onmessage = e => finish(e.data);
  worker.onerror = e => finish({error:e.message || 'Unable to start query worker.'});
  worker.postMessage({database:exportDatabase(), query:$('query').value});
};
$('stop').onclick = () => {
  const restoring = workerOperation === 'restore';
  worker?.terminate(); worker = null; workerOperation = 'query'; busy(false);
  if (restoring) status('Restore stopped. Current data was kept.');
  else { $('query-results').replaceChildren(node('p', 'Query stopped. Changes from this run were discarded.', 'muted')); status('Query stopped.'); }
};
$('clear').onclick = () => $('query-results').replaceChildren(node('p', 'Query results will appear here.', 'muted'));
$('query').onkeydown = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('run').click(); }
  if (e.key === 'Tab') { e.preventDefault(); const input = e.target; input.setRangeText('    ', input.selectionStart, input.selectionEnd, 'end'); input.dispatchEvent(new Event('input')); }
};
$('query').oninput = () => {
  try { localStorage.setItem('sql-terminal-query', $('query').value); }
  catch (error) { status('Could not save query locally: ' + error.message, true); }
};
(async () => {
  try {
    SQL = await initSqlJs({locateFile:file => `vendor/${file}`});
    const stored = localStorage.getItem(KEY);
    databaseTag = storageTag(stored || '');
    db = stored ? new SQL.Database(Uint8Array.from(atob(stored), c => c.charCodeAt(0))) : new SQL.Database();
    db.run('PRAGMA foreign_keys=ON');
    const query = localStorage.getItem('sql-terminal-query'); if (query !== null) $('query').value = query;
    restoreDataDrafts();
    busy(false);
    if (!$('status').classList.contains('error')) status('Ready.');
  } catch (error) { status('Could not load database: ' + error.message + '. Serve this folder over HTTP.', true); }
})();
