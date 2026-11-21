importScripts('vendor/sql-wasm.js', 'data-generator.js');
onmessage = async ({data}) => {
  let db;
  try {
    const SQL = await initSqlJs({locateFile:file => `vendor/${file}`});
    db = new SQL.Database(data.database); db.run('PRAGMA foreign_keys=ON');
    const result = generateRelatedData(db, data.plan);
    postMessage({database:db.export(), ...result});
  } catch (error) { postMessage({error:error.message}); }
  finally { db?.close(); }
};
