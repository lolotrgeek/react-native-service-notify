; (function () {
  const config = {
    port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
    host: 'localhost'
  };
  const Gun = require('gun')
  const path = require('path')

  config.server = require('http').createServer(Gun.serve(__dirname));

  // console.log('GUN config ', config)

  const gun = new Gun({
    // Defaults
    web: config.server.listen(config.port, config.host),
    file: path.join(__dirname, 'radata'),

  })
  console.log('Relay peer started on port ' + config.port + ' with /gun');

  const native = require('./native-bridge')

  native.channel.on('get', msg => {
    console.log('[React node] incoming get: ' + typeof msg + msg)
    let response
    try {
      response = JSON.parse(msg)
    } catch (error) {
      response = msg
    }

    gun.get('app').on((data, key) => {
      console.log('[GUN node] Data Found: ' + data)
      native.channel.post('get', data)
    })

  })

  native.channel.on('put', msg => {
    console.log('[React node] incoming put: ' + typeof msg + msg)
    let input
    try {
      input = JSON.parse(msg)
    } catch (error) {
      response = msg
    }

    if (typeof input.key === 'string') {
      console.log('[React node] storing ' + input.key + input.value)
      const key = input.key
      gun.get('app').put({value: input.value}, ack => {
        console.log('[GUN node] ACK: ', ack)
        native.channel.post('put', ack)
      })
    }

  })

  // gun.get('app').get('hello').put({value: 'world'}, ack => console.log('ACK: ' , ack))
  // gun.get('app').get('hello').on((data, key) => {
  //   console.log('Data Found!' + data)
  // })

  module.exports = gun;
}());

