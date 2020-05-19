const sqlite = require('./sqlite3')

const db = new sqlite.Database('testDB.db', 'OPEN_READWRITE | OPEN_CREATE', err => {
    console.log('[node] db :' + err)
} )



// db.run(`CREATE TABLE IF NOT EXISTS ${this.tableName} (keyField PRIMARY KEY, key, field, val, rel, state, type)`, [], (err) => {
//     console.log(err ? err : 'Insert Success!')
// })

// db.all(`SELECT * FROM ${this.tableName} WHERE keyField = ?`, [], (err, rows) => {
//     err ? console.log(err) : rows.map(row=> console.log('Row: ', row))
// })