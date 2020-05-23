const { hostname } = require('os');

; (function () {
  const config = { 
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765 ,
    host: 'localhost'
  };
  const Gun = require('gun')
  const GunSQLite = require('./gun-sqlite');
  const adapter = GunSQLite.bootstrap(Gun);

  config.server = require('http').createServer(Gun.serve(__dirname));

  console.log('GUN config ', config)

  const gun = new Gun({
    // Defaults
    web: config.server.listen(config.port, config.host),
    file: false,
    radisk: false,
    localStorage: false,
    sqlite: {
      database_name: "GunDB.db",
      // database_location: "default", // for concerns about location on iOS, see [here](https://github.com/andpor/react-native-sqlite-storage#opening-a-database)
      onOpen: () => { },
      onErr: err => { },
      onReady: err => debug && console.log('Ready') // don't attempt to read/write from Gun until this has been called unless you like to live dangerously
    }
  })
  console.log('Relay peer started on port ' + config.port + ' with /gun');

  gun.get('hello').put({value: 'world'}, ack => console.log('ACK: ' , ack))
  gun.get('hello').on((data, key) => {
    console.log('Data Found!' + data)
  })
  module.exports = gun;
}());

