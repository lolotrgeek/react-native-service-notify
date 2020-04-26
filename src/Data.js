import Gun from 'gun'
import AsyncStorage from '@react-native-community/async-storage';

const debug = false

debug && console.log('using native Storage...')

class Adapter {
    constructor(db) {
        this.db = db;
        // Preserve the `this` context for read/write calls.
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
    }
    read(context) {
        const { get, gun } = context;
        const { "#": key } = get;
        const done = (err, data) => {
            this.db.on("in", {
                "@": context["#"],
                put: Gun.graph.node(data),
                //not needed. this solves an issue in gun https://github.com/amark/gun/issues/877
                _: function () { },
                err
            });
        };
        AsyncStorage.getItem(key, (err, result) => {
            if (err) {
                done(err);
            }
            else if (result === null) {
                // Nothing found
                done(null);
            }
            else {
                done(null, JSON.parse(result));
            }
        });
    }
    write(context) {
        // const { gun } = context;
        if (context['@']) {
            debug && console.log('CONTEXT ', context)
            const graph = context._.put
            if (graph && typeof graph === 'object') {
                debug && console.log('GRAPH ', graph)
                const keys = Object.keys(graph);
                const instructions = keys.map((key) => [
                    key,
                    JSON.stringify(graph[key])
                ]);
                AsyncStorage.multiMerge(instructions, (err) => {
                    this.db.on("in", {
                        "@": context["#"],
                        ok: !err || err.length === 0,
                        err
                    });
                });
            }
        }
    }
}

Gun.on("create", (db) => {
    const adapter = new Adapter(db);
    // Allows other plugins to respond concurrently.
    const pluginInterop = (middleware) => function (ctx) {
        this.to.next(ctx);
        return middleware(ctx);
    };
    // Register the adapter
    db.on("get", pluginInterop(adapter.read));
    db.on("put", pluginInterop(adapter.write));
});


const port = '8765'
const address = '192.168.1.109'
const peers = [`http://${address}:${port}/gun`]

export const gun = new Gun({
    localStorage: false,
    peers: peers,
})


export const getAllEntries = async () => {
    //debug && console.info('ASYNC STORAGE - getting all entries... ')
    const keys = await AsyncStorage.getAllKeys()
    debug && console.info('ASYNC STORAGE - KEYS :', keys)
    const stores = await AsyncStorage.multiGet(keys)
    debug && console.log('Entries: ' + stores)
    return stores
};
// (async () => await getAllEntries())();


/**
 *  DANGER- Delete entire async Storage
 * @param {function} state
 */
export const removeAll = async () => {
    try {
        debug && console.info('ASYNC STORAGE - REMOVING ALL')
        await AsyncStorage.clear()
    } catch (error) {
        debug && console.error(error)
    }
}
// removeAll()