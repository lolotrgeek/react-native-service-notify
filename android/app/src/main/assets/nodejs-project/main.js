var http = require('http');
var leftPad = require('left-pad');

var versions_server = http.createServer((request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions) + ' left-pad: ' + leftPad(42, 5, '0'));
});

versions_server.listen(3000);
console.log('The node project has started.');
; (function () {
  const config = { port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765 };
  const Gun = require('gun')
  const GunSQLite = require('gun-sqlite');
  const adapter = GunSQLite.bootstrap(Gun);

  config.server = require('http').createServer(Gun.serve(__dirname));

  const gun = new Gun({
    // Defaults
    web: config.server.listen(config.port),
    file: false,
    radisk: false,
    localStorage: false,
    sqlite: {
      database_name: "GunDB.db",
      database_location: "default", // for concerns about location on iOS, see [here](https://github.com/andpor/react-native-sqlite-storage#opening-a-database)
      onOpen: () => { },
      onErr: err => { },
      onReady: err => debug && console.log('Ready') // don't attempt to read/write from Gun until this has been called unless you like to live dangerously
    }
  })
  console.log('Relay peer started on port ' + config.port + ' with /gun');

  module.exports = gun;
}());

