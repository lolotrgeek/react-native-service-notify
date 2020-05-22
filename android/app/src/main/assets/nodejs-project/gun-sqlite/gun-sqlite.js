const KeyValAdapter = require('./key-val-adapter');
const sqlite = require('./sqlite-native');
const coerce = require('./coerce');
const processRow = require('./process-row');

const adapter = new KeyValAdapter({

    /**
     * @param {Gun}          ctx   The gun instance serving the Gun db
     * @param {object|null}  opt   Options passed when instantiating Gun, if any
     * @param {boolean}      once  When called via `gun.opt`, `once` is true; during construction, it is false
     */
    opt: function (ctx, opt, once) {
        if (once) {
            return;
        }

        // Acquire DB connection
        const sqlOpt = opt.sqlite || {};
        sqlOpt.onReady = opt.onReady || (() => { });
        sqlOpt.onOpen = (() => {})
        sqlOpt.onError = ((err) => {})
        this.db = new sqlite.Database(sqlOpt.database_name || "GunDB.db", 'OPEN_READWRITE | OPEN_CREATE', err => err ? sqlOpt.onError(err) : sqlOpt.onReady.call(null));
        this.tableName = sqlOpt.table || "GunTable";

        // Prepare the DB for writes with table and indexes
        this.db.run(`CREATE TABLE IF NOT EXISTS ${this.tableName} (keyField PRIMARY KEY, key, field, val, rel, state, type)`, [], (err) => {
            err ? sqlOpt.onError(err) : sqlOpt.onReady.call(null)
        })
        this.db.run(`CREATE INDEX IF NOT EXISTS ${this.tableName}_index ON ${this.tableName} (keyField, key)`, [], (err) => {
            err ? sqlOpt.onError(err) : sqlOpt.onReady.call(null)
        })
    },

    /**
     * Retrieve Nodes from SQLiteStorage
     * 
     * @param {string}   key        The node key to lookup
     * @param {string}   [field]    The field to lookup, if given
     * @param {function} done       Callback for when lookup finishes
     */
    get: function (key, field, done) {

        // Retrieve field only
        if (field) {
            const keyField = `${key}_${field}`;
            this.db.all(`SELECT * FROM ${this.tableName} WHERE keyField = ?`, [keyField], (err, rows) => {
                err ? done(err) : done(null, rows.map(processRow))
            })
            // Retrieve entire node
        } else {
            this.db.all(`SELECT * FROM ${this.tableName} WHERE key = ?`, [key], (err, rows) => {
                err ? done(err) : done(null, rows.map(processRow))
            })
        }
    },

    /**
     * Write nodes to storage
     * 
     * @param {Array.object}  batch    The batch writes of key:value pairs
     * @param {function}      done     Called after write is complete
     */
    put: function (batch, done) {
        // Produce an array of upsert queries
        const inserts = batch.map(node => {
            const keyField = `${node.key}_${node.field}`;
            return {
                sql: `INSERT OR REPLACE INTO ${this.tableName} (keyField, key, field, val, rel, state, type) VALUES (?,?,?, COALESCE(?, ""),COALESCE(?, ""),COALESCE(?, 0),COALESCE(?, 3))`,
                vars: [keyField, node.key, node.field, node.val + "", node.rel + "", node.state, coerce(node.val)]
            };
        });

        // Run transations
        const errs = []
        inserts.forEach(row => this.db.run(row.sql, row.vars, err => errs.push(err)))
        if(errs.length > 0) {
            done(errs)
        } else {
            done(null)
        }    
    }
});

/**
 * Clean out old graph data from the DB given a timestamp
 * 
 * @todo Implement a smarter, configurable LRU algorithm.
 * 
 * @param {integer}  number   The timestamp to delete before which to delete all data
 * @param {function} cb       A function to call after success/error  
 */
adapter.clean = function (timestamp, cb) {
    if (!timestamp) {
        return;
    }

    const ctx = this.outerContext;
    ctx.db.run(`DELETE FROM ${ctx.tableName} WHERE state < ?`, [timestamp],cb,);
}


module.exports = adapter;