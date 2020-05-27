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
  const app = gun.get('app')

  /**
   * 
   * @param {*} input 
   */
  const parser = input => {
    try {
      input = JSON.parse(input)
    } catch (error) {
      console.log('[Parse node] not a JSON object')
    } finally {
      return input
    }
  }

  /**
   * Create a chain by recursing through nested objects, adding each key to the chain
   * until we hit a string value
   * @param {*} input 
   * @param {*} chain 
   */
  const chainer = (input, chain) => {
    if (!input || !chain) {
      console.log('[Chain node] no input or chain')
      return false
    }
    input = parser(input)
    if (typeof input === 'string') {
      console.log('[Chain node] Ending chain with: ', input)
      if (input.length === 0) return chain
      chain = chain.get(input)
    }
    else if (typeof input === 'object' && Object.keys(input).length > 0) {
      for (key in input) {
        console.log('[Chain node] Chaining key:', key)
        let value = input[key]
        if (typeof value === 'object') {
          console.log('[Chain node] Extending chain: ', value)
          chain = chain.get(key)
        }
        chainer(value, chain)
      }
    }
    console.log('[Chain node] done.')
    return chain

  }

  const getOne = (msg) => {
    const chain = chainer(msg, app)
    console.log('[React node] Chain :', chain)
    chain.on((data, key) => {
      console.log('[GUN node] Data Found: ' + data)
      // if doesn't send each, might want to put in an array...
      native.channel.post('done', { got: data })
    })
  }

  const getAll = (msg) => {
    const chain = chainer(msg, app)
    console.log('[React node] Chain :', chain)
    chain.map().on((data, key) => {
      console.log('[GUN node] Data Found: ' , data)
      // if doesn't send each, might want to put in an array...
      native.channel.post('done', { got: data })
    })
  }

  const putAll = (msg) => {
    const input = JSON.parse(msg)
    const chain = chainer(input, app)
    console.log('[React node] Chain :', chain)
    app.put(input, ack => {
      console.log('[GUN node] ACK: ', ack)
      native.channel.post('done', { put: ack })
    })
  }

  native.channel.on('get', msg => {
    console.log('[React node] incoming get: ' + typeof msg + msg)
    try {
      console.log('[GUN node] Getting : ' + msg)
      getOne(msg)
    } catch (error) {
      console.log('[GUN node] : Getting failed' + error)
    }
  })

  native.channel.on('put', msg => {
    console.log('[React node] incoming put: ' + typeof msg + msg)
    try {
      console.log('[React node] storing - ' + msg)
      putAll(msg)
    } catch (error) {
      console.log('[GUN node] : Putting failed' + error)
    }
  })

  // gun.get('app').get('hello').put({value: 'world'}, ack => console.log('ACK: ' , ack))
  // gun.get('app').get('hello').on((data, key) => {
  //   console.log('Data Found!' + data)
  // })

  module.exports = gun;
}());

