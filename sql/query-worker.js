importScripts('vendor/sql-wasm.js');
onmessage = async ({data}) => {
  let db;
  try {
    const SQL = await initSqlJs({locateFile: file => `vendor/${file}`});
    db = new SQL.Database(data.database);
    db.run('PRAGMA foreign_keys = ON');
    if (data.restore) {
      if (!data.query.trim()) throw Error('The SQL file is empty.');
      db.run(data.query);
      // Accept SQL files with or without an explicit final COMMIT.
      try { db.run('COMMIT'); } catch (error) {
        if (!error.message.includes('no transaction is active')) throw error;
      }
      if (!db.exec("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'")[0]?.values.length) throw Error('No tables found in the SQL file.');
      if (db.exec('PRAGMA foreign_key_check')[0]?.values.length) throw Error('The SQL file contains invalid foreign key references.');
      postMessage({database:db.export()});
      return;
    }
    const results = [];
    for (const statement of db.iterateStatements(data.query)) {
      const before = db.exec('SELECT total_changes()')[0].values[0][0];
      const columns = statement.getColumnNames();
      const values = [];
      let truncated = false;
      while (statement.step()) {
        if (values.length === 1000) { truncated = true; break; }
        values.push(statement.get());
      }
      results.push({columns, values, truncated, changes: columns.length ? 0 : db.exec('SELECT total_changes()')[0].values[0][0] - before});
    }
    postMessage({results, database: db.export()});
  } catch (error) {
    postMessage({error: error.message, database: !data.restore && db ? db.export() : null});
  } finally { if (db) db.close(); }
};
