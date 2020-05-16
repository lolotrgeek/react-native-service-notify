var http = require('http');
var leftPad = require('left-pad');

var versions_server = http.createServer((request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions) + ' left-pad: ' + leftPad(42, 5, '0'));
});

versions_server.listen(3000);
console.log('The node project has started.');

// Require the 'native-bridge' to enable communications between the
// Node.js app and the Native app.
const native = require('./native-bridge');

// Send a message to Native.
native.channel.send('main.js loaded');

// Post an event to Native.
native.channel.post('started');

// Post an event with a message.
native.channel.post('started', 'main.js loaded');

// A sample object to show how the channel supports generic
// JavaScript objects.
class Reply {
  constructor(replyMsg, originalMsg) {
    this.reply = replyMsg;
    this.original = originalMsg;
  }
};

// Listen to messages from Native.
native.channel.on('message', (msg) => {
  console.log('[node] MESSAGE received: "%s"', msg);
  // Reply sending a user defined object.
  native.channel.send(new Reply('Message received!', msg));
});

// Listen to event 'myevent' from Native.
native.channel.on('myevent', (msg) => {
  console.log('[node] MYEVENT received with message: "%s"', msg);
});

// Handle the 'pause' and 'resume' events.
// These are events raised automatically when the app switched to the
// background/foreground.
native.app.on('pause', (pauseLock) => {
  console.log('[node] app paused.');
  pauseLock.release();
});

native.app.on('resume', () => {
  console.log('[node] app resumed.');
  native.channel.post('engine', 'resumed');
});

native.app.on('alive', () => {
  console.log('[node] app alive.');
});


; (function () {
  const config = { port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765 };
  const Gun = require('gun')
  // const GunSQLite = require('gun-sqlite');
  // const adapter = GunSQLite.bootstrap(Gun);

  config.server = require('http').createServer(Gun.serve(__dirname));

  const gun = new Gun({
    // Defaults
    web: config.server.listen(config.port),
    file: false,
    radisk: false,
    localStorage: false,
    // sqlite: {
    //   database_name: "GunDB.db",
    //   database_location: "default", // for concerns about location on iOS, see [here](https://github.com/andpor/react-native-sqlite-storage#opening-a-database)
    //   onOpen: () => { },
    //   onErr: err => { },
    //   onReady: err => debug && console.log('Ready') // don't attempt to read/write from Gun until this has been called unless you like to live dangerously
    // }
  })
  console.log('Relay peer started on port ' + config.port + ' with /gun');

  module.exports = gun;
}());

