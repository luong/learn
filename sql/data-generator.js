'use strict';
function generateTableData(db, table, count) {
  if (!Number.isInteger(count) || count < 1 || count > 10000) throw Error('Enter a whole number from 1 to 10,000.');
  const q = name => '"' + name.replaceAll('"', '""') + '"';
  const rows = (sql, params = []) => db.exec(sql, params)[0]?.values || [];
  const create = rows("SELECT sql FROM sqlite_schema WHERE type='table' AND name=?", [table])[0]?.[0];
  if (!create || /^CREATE\s+VIRTUAL/i.test(create)) throw Error('Select a regular table to generate data.');
  const fields = rows(`PRAGMA table_xinfo(${q(table)})`).filter(f => f[6] === 0).map(f => ({name:f[1], type:f[2].toUpperCase(), required:!!f[3] || !!f[5], default:f[4], pk:f[5]}));
  const primary = fields.filter(f => f.pk);
  const auto = primary.length === 1 && primary[0].type === 'INTEGER' && !/\bWITHOUT\s+ROWID\b/i.test(create) ? primary[0].name : null;
  const numericStarts = new Map();
  fields.filter(f => /INT|REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL/.test(f.type) && !/BOOL/.test(f.type)).forEach(f => {
    const max = rows(`SELECT COALESCE(MAX(CASE WHEN typeof(${q(f.name)}) IN ('integer','real') THEN ${q(f.name)} END),0) FROM ${q(table)}`)[0][0];
    numericStarts.set(f.name, Math.max(0, Math.ceil(Number(max))));
  });
  const foreign = new Map();
  for (const row of rows(`PRAGMA foreign_key_list(${q(table)})`)) {
    if (!foreign.has(row[0])) foreign.set(row[0], {table:row[2], parts:[]});
    foreign.get(row[0]).parts.push({order:row[1], from:row[3], to:row[4]});
  }
  const relations = [...foreign.values()].map(relation => {
    relation.parts.sort((a,b) => a.order-b.order);
    const parentKey = rows(`PRAGMA table_info(${q(relation.table)})`).filter(f => f[5]).sort((a,b) => a[5]-b[5]);
    const targets = relation.parts.map((part,i) => part.to || parentKey[i]?.[1]);
    if (targets.some(name => !name)) throw Error('Cannot resolve a referenced primary key.');
    relation.context = rows(`PRAGMA table_info(${q(relation.table)})`).map(f => f[1]);
    relation.values = rows(`SELECT ${[...targets, ...relation.context].map(q).join(', ')} FROM ${q(relation.table)} WHERE ${targets.map(name => `${q(name)} IS NOT NULL`).join(' AND ')} LIMIT 10000`);
    if (!relation.values.length && relation.parts.some(part => fields.find(f => f.name === part.from)?.required)) throw Error(`Add data to the referenced table "${relation.table}" first.`);
    return relation;
  });
  const included = fields.filter(f => f.name !== auto || relations.some(relation => relation.parts.some(part => part.from === f.name)));
  const insert = included.length ? `INSERT INTO ${q(table)} (${included.map(f => q(f.name)).join(', ')}) VALUES (${included.map(() => '?').join(', ')})` : `INSERT INTO ${q(table)} DEFAULT VALUES`;
  const base = rows(`SELECT count(*) FROM ${q(table)}`)[0][0];
  const firstNames = ['An','Binh','Chi','Dung','Giang','Ha','Hoa','Khanh','Lan','Linh','Minh','Nam','Phuc','Quang','Thao','Trang','Tuan','Vy'];
  const lastNames = ['Nguyen','Tran','Le','Pham','Hoang','Huynh','Phan','Vu','Vo','Dang','Bui','Do'];
  const subjects = ['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Science'];
  const cities = ['Ha Noi','Ho Chi Minh City','Da Nang','Hai Phong','Hue','Can Tho'];
  const streets = ['Le Loi','Nguyen Trai','Tran Phu','Hai Ba Trung','Nguyen Hue','Le Duan'];
  const departments = ['Science','Languages','Mathematics','Technology','Humanities','Arts'];
  const products = ['Notebook','Pencil','Backpack','Ruler','Calculator','Textbook','Pen','Eraser'];
  const normalized = name => name.replace(/([a-z])([A-Z])/g, '$1_$2').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'_');
  const tableKind = normalized(table);
  const now = new Date();
  const sample = (field, attempt) => {
    const serial = base + attempt + 1, index = serial - 1;
    const name = normalized(field.name);
    const first = firstNames[index % firstNames.length];
    const last = lastNames[(Math.floor(index / firstNames.length) + index * 5) % lastNames.length];
    const cycle = Math.floor(index / (firstNames.length * lastNames.length));
    const fullName = `${last} ${first}${cycle ? ' ' + (cycle + 1) : ''}`;
    const age = 15 + index % 3, grade = age - 5;
    const city = cities[index % cities.length];
    const birthMonth = (index * 7) % 12, birthDay = (index * 11) % 28 + 1;
    const laterBirthday = birthMonth > now.getMonth() || (birthMonth === now.getMonth() && birthDay > now.getDate());
    const birthDate = new Date(Date.UTC(now.getFullYear() - age - Number(laterBirthday), birthMonth, birthDay)).toISOString().slice(0,10);
    const date = new Date(Date.UTC(now.getFullYear(), 0, 1 + index % 365)).toISOString().slice(0,10);
    if (/BOOL/.test(field.type)) return index % 2;
    if (/INT|REAL|FLOAT|DOUBLE|NUMERIC|DECIMAL/.test(field.type)) {
      // Identifiers stay distinct; measurements use plausible ranges.
      if (!field.pk && !/(^|_)(id|code|ma)($|_)/.test(name)) {
        let value;
        if (/(^|_)(age|tuoi)($|_)/.test(name)) value = age;
        else if (/percent|percentage|phan_tram/.test(name)) value = 50 + index % 51;
        else if (/score|mark|gpa|diem|rating/.test(name)) value = /gpa/.test(name) ? 2 + (index % 21) / 10 : /rating/.test(name) ? 1 + index % 5 : 5 + (index % 51) / 10;
        else if (/grade|class|lop/.test(name)) value = grade;
        else if (/birth_year|nam_sinh/.test(name)) value = Number(birthDate.slice(0,4));
        else if (/year|nam_hoc/.test(name)) value = now.getFullYear() - index % 3;
        else if (/price|cost|gia|amount|total|balance|salary/.test(name)) value = 10000 + (index % 100) * 5000;
        else if (/quantity|qty|stock|count|credits|so_luong|tin_chi/.test(name)) value = 1 + index % 10;
        else if (/height|chieu_cao/.test(name)) value = 150 + index % 36;
        else if (/weight|can_nang/.test(name)) value = 45 + index % 36;
        if (value !== undefined) return /INT/.test(field.type) ? Math.round(value) : Number(value.toFixed(2));
      }
      const number = numericStarts.get(field.name) + attempt + 1;
      if (!Number.isSafeInteger(number)) throw Error(`Cannot safely generate numbers for "${field.name}".`);
      return /INT/.test(field.type) ? number : number + 0.25;
    }
    if (/BLOB/.test(field.type)) return new TextEncoder().encode(`Record ${serial}`);
    let text;
    let shortText;
    if (/email|e_mail/.test(name)) text = `${first.toLowerCase()}.${last.toLowerCase()}${serial}@example.com`;
    else if (/phone|mobile|tel|dien_thoai|sdt/.test(name)) text = '09' + String(serial).padStart(8,'0');
    else if (/birth|dob|ngay_sinh/.test(name) || /DATE/.test(field.type) && /birth|sinh/.test(name)) text = birthDate;
    else if (/DATE|TIME/.test(field.type) || /date|created_at|updated_at|ngay/.test(name)) text = /TIME/.test(field.type) || /_at$/.test(name) ? date + ' 08:00:00' : date;
    else if (/first_name|given_name|ten$/.test(name) && !/ho_ten/.test(name)) text = first;
    else if (/last_name|surname|family_name/.test(name)) text = last;
    else if (/username|user_name|login/.test(name)) text = `${first.toLowerCase()}${serial}`;
    else if (/gender|sex|gioi_tinh/.test(name)) text = index % 2 ? 'Female' : 'Male';
    else if (/address|dia_chi/.test(name)) text = `${10 + index % 190} ${streets[index % streets.length]}, ${city}`;
    else if (/city|town|thanh_pho/.test(name)) text = city;
    else if (/country|quoc_gia/.test(name)) text = 'Vietnam';
    else if (/department|faculty|khoa/.test(name)) text = departments[index % departments.length];
    else if (/subject|course|mon_hoc/.test(name) || /name|title|ten/.test(name) && /course|subject|mon_hoc/.test(tableKind)) {
      text = subjects[index % subjects.length]; shortText = ['Math','Eng','Phy','Chem','Bio','Hist','Geo','CS'][index % subjects.length];
    }
    else if (/class|lop/.test(name)) text = `${grade}${String.fromCharCode(65 + index % 4)}${1 + Math.floor(index / 12) % 3}`;
    else if (/status|trang_thai/.test(name)) text = ['Active','Pending','Completed'][index % 3];
    else if (/category|danh_muc/.test(name)) text = ['Books','Stationery','Electronics','School supplies'][index % 4];
    else if (/name|title|ho_ten/.test(name)) {
      text = /product|item|san_pham/.test(tableKind) ? products[index % products.length] + ' ' + serial : fullName;
      shortText = first + (cycle ? ' ' + (cycle + 1) : '');
    }
    else if (/description|note|comment|mo_ta|ghi_chu/.test(name)) text = ['Completed the assignment','Joined the study group','Submitted work on time','Preparing for the next exam'][index % 4];
    else if (/code|(^|_)id$|(^|_)ma($|_)/.test(name)) text = `${/student|hoc_sinh/.test(tableKind) ? 'ST' : /course|subject/.test(tableKind) ? 'CS' : 'R'}${String(serial).padStart(4,'0')}`;
    else text = `Record ${serial}`;
    const length = /(?:VAR)?CHAR\s*\((\d+)\)/.exec(field.type);
    if (length && text.length > Number(length[1])) {
      const max = Number(length[1]);
      if (shortText && shortText.length <= max) text = shortText;
      else if (/email|e_mail/.test(name)) {
        text = `${first[0].toLowerCase()}${serial}@example.com`;
        if (text.length > max) throw Error(`"${field.name}" is too short for a meaningful example email. Increase its length.`);
      }
      else if (/DATE|TIME/.test(field.type) || /phone|mobile|birth|dob|date|ngay/.test(name)) throw Error(`"${field.name}" is too short for its generated value. Increase its length.`);
      else text = text.slice(0,max);
    }
    return text;
  };
  let inserted = 0, lastError = '', attempt = 0;
  const limit = Math.max(100, Math.min(200000, count * 20));
  db.run('SAVEPOINT generate_table');
  try {
    while (inserted < count && attempt < limit) {
      const values = new Map(included.map(f => [f.name, sample(f, attempt)]));
      let stride = 1;
      for (const relation of relations) {
        const tuple = relation.values.length ? relation.values[Math.floor(attempt / stride) % relation.values.length] : null;
        relation.parts.forEach((part,i) => values.set(part.from, tuple ? tuple[i] : null));
        if (tuple) {
          const aliases = new Set([normalized(relation.table), normalized(relation.table).replace(/s$/, ''), ...relation.parts.map(part => normalized(part.from).replace(/_(id|code)$/, ''))]);
          relation.context.forEach((parentColumn, i) => {
            const related = included.find(field => !field.pk && !relation.parts.some(part => part.from === field.name) && [...aliases].some(alias => normalized(field.name) === alias + '_' + normalized(parentColumn)));
            if (related) values.set(related.name, tuple[relation.parts.length + i]);
          });
        }
        stride = Math.min(Number.MAX_SAFE_INTEGER, stride * Math.max(1, relation.values.length));
      }
      attempt++;
      db.run('SAVEPOINT generated_row');
      try {
        db.run(insert, included.map(f => values.get(f.name)));
        if (db.getRowsModified() !== 1) throw Error('Constraint failed: the insert was ignored.');
        db.run('RELEASE generated_row'); inserted++;
      } catch (error) {
        db.run('ROLLBACK TO generated_row'); db.run('RELEASE generated_row');
        if (!/constraint failed/i.test(error.message)) throw error;
        lastError = error.message;
      }
    }
    if (inserted !== count) throw Error(`Could not generate ${count} valid rows with these constraints. No rows were added.${lastError ? ' ' + lastError : ''}`);
    if (rows('PRAGMA foreign_key_check').length) throw Error('Generated data would violate a foreign key constraint.');
    db.run('RELEASE generate_table');
  } catch (error) { try { db.run('ROLLBACK TO generate_table'); db.run('RELEASE generate_table'); } catch {} throw error; }
}

function generateRelatedData(db, plan) {
  const q = name => '"' + name.replaceAll('"', '""') + '"';
  const rows = (sql, params = []) => db.exec(sql, params)[0]?.values || [];
  const names = rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'").flat();
  if (!Array.isArray(plan) || plan.some(item => !names.includes(item.table) || !Number.isInteger(item.count) || item.count < 0 || item.count > 10000)) throw Error('Invalid generation plan.');
  const requested = new Map(plan.filter(item => item.count).map(item => [item.table, item.count]));
  if (!requested.size) throw Error('Choose at least one table with rows to add.');
  const state = new Map(), order = [];
  const visit = table => {
    if (state.get(table) === 'done') return;
    if (state.get(table) === 'visiting') throw Error(`Circular foreign keys include "${table}". Generate seed rows for this relationship first using Query.`);
    state.set(table, 'visiting');
    for (const referenced of new Set(rows(`PRAGMA foreign_key_list(${q(table)})`).map(r => r[2]))) {
      const parent = names.find(name => name.toLowerCase() === referenced.toLowerCase());
      if (!parent) throw Error(`Referenced table "${referenced}" does not exist.`);
      const populated = rows(`SELECT EXISTS(SELECT 1 FROM ${q(parent)} LIMIT 1)`)[0][0];
      if (parent === table || state.get(parent) === 'visiting') {
        if (!populated) {
          const columns = rows(`PRAGMA table_info(${q(table)})`);
          const required = rows(`PRAGMA foreign_key_list(${q(table)})`).filter(r => r[2].toLowerCase() === parent.toLowerCase()).some(r => columns.some(c => c[1] === r[3] && (c[3] || c[5])));
          if (required) throw Error(`Circular foreign keys include "${table}" and "${parent}". Add seed rows using Query first.`);
        }
        continue;
      }
      if (requested.has(parent)) visit(parent);
    }
    state.set(table, 'done'); order.push(table);
  };
  for (const table of requested.keys()) visit(table);
  db.run('BEGIN');
  try {
    for (const table of order) {
      try { generateTableData(db, table, requested.get(table)); }
      catch (error) { throw Error(`${table}: ${error.message}`); }
    }
    if (rows('PRAGMA foreign_key_check').length) throw Error('Generated data would violate a foreign key constraint.');
    db.run('COMMIT');
    return {count:[...requested.values()].reduce((sum,count) => sum + count,0), tables:requested.size};
  } catch (error) { try { db.run('ROLLBACK'); } catch {} throw error; }
}
