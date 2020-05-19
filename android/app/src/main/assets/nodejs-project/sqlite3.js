// Require the 'native-bridge' to enable communications between the
// Node.js app and the Native app.
const native = require('./native-bridge');

native.channel.post('started', 'sqlite3.js loaded')

class Database {
    /**
     * 
     * @param {string} filename 
     * @param {string} mode (optional): One or more of `OPEN_READONLY`, `OPEN_READWRITE`and `OPEN_CREATE`. The default value is `OPEN_READWRITE | OPEN_CREATE`.
     * @param {*} callback (Optional): called when the database was opened successfully or when an error occurred. 
     */
    constructor(filename, mode, callback) {
        this.filename = filename
        this.mode = mode ? mode : ''
        this.callback = callback ? callback : () => {}
        const config = {
            filename: this.filename,
            mode: this.mode,
        }
        native.channel.post('sqliteDatabase', JSON.stringify(config))
        native.channel.on('sqliteDatabase', msg => {
            let response = JSON.parse(msg)
            callback(response.err) // if null, was success
        })
    }

    /**
     * 
     * @param {string} sql 
     * @param {array} params 
     * @param {function} callback 
     */
    run(sql, params, callback) {
        const query = {
            sql: sql,
            params: params,
        }
        native.channel.post('sqliteRun', JSON.stringify(query));
        native.channel.on('sqliteRun', msg => {
            console.log('[node] MESSAGE received: "%s"', msg);
            let response = JSON.parse(msg)
            callback(response.err) // if null, was success
        });

    }


    all(sql, params, callback) {
        const query = {
            sql: sql,
            params: params,
        }
        native.channel.post('sqliteAll', JSON.stringify(query));
        native.channel.on('sqliteAll', msg => {
            console.log('[node] MESSAGE received: "%s"', msg);
            let response = JSON.parse(msg)
            callback(response.err, response.rows)
        });
    }
}
module.exports = {
    Database: Database,
    verbose: () => {}
}
