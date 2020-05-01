import Gun from 'gun/gun'
import GunSQLite from '@lolotrgeek/gun-react-native-sqlite';
import SQLite from 'react-native-sqlite-storage'

const debug = true

debug && console.log('using Native Storage...')

//TODO process to find signal server
const port = '8765'
const address = '192.168.1.109'
const peers = [`http://${address}:${port}/gun`]

const adapter = GunSQLite.bootstrap(Gun);

export const gun = new Gun({
  // Defaults
  peers: peers,
  sqlite: {
    database_name: "GunDB.db",
    database_location: "default", // for concerns about location on iOS, see [here](https://github.com/andpor/react-native-sqlite-storage#opening-a-database)
    onOpen: () => { },
    onErr: err => { },
    onReady: err => debug && console.log('Ready') // don't attempt to read/write from Gun until this has been called unless you like to live dangerously
  }
})

// Clean Out DB
export const cleanDB = () => {
  adapter.clean(Date.now() - (1000 * 60 * 60 * 24), err => {
    if (!err) {
      debug && console.log("All cleaned up!");
    }
  });
}

// Look at DB directly
export const dumpDB = () => {
  let db = SQLite.openDatabase({ name: "GunDB.db", location: "default" })
  db.transaction(tx => {
    debug && console.log('SELECTING ENTIRE TABLE')
    tx.executeSql("SELECT * FROM GunTable", [],
      (tx, results) => debug && console.table(results.rows.raw()),
      (tx, err) => debug && console.warn(err))
  });
}

// Kill entire DB
export const deleteGunTable = () => {
  let db = SQLite.openDatabase({ name: "GunDB.db", location: "default" })
  db.transaction(tx => {
    debug && console.log('DROPPING DB')
    tx.executeSql('DROP TABLE GunTable', [],
      (tx, results) => debug && console.warn('DROPPED: ', results),
      (tx, err) => debug && console.warn(err))
  })
}
// deleteGunTable()