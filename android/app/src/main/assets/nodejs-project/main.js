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
   * Create a chain by recursing nested objects, adding each key to the chain until hitting a string value
   * 
   * @param {*} input `{key1: {key2: ''}}`
   * @param {*} chain 
   */
  const chainerCompat = (input, chain) => {
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
        chainerCompat(value, chain)
      }
    }
    console.log('[Chain node] done.')
    return chain
  }

  /**
 * Create a chain by splitting a key string, adding each split to the chain
 * 
 * @param {*} input `key1\key2\...`
 * @param {*} chain 
 */
  const chainer = (input, chain) => {
    if (!input || !chain) {
      console.log('[Chain node] no input or chain')
      return false
    }
    
    if (typeof input === 'string') {
      if (input.length === 0) return chain
      input = input.split('/')
      // chainer(input, chain)
      // if (input.length === 0) return chain
      while (input.length > 0) {
        console.log('[Chain node] Chaining key:', input[0])
        chain = chain.get(input[0])
        input = input.slice(1)
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
      console.log('[GUN node] Data Found: ', data)
      // if doesn't send each, might want to put in an array...
      native.channel.post('done', { got: data })
    })
  }

  /**
   * Assign a value to keys, needs to parse JSON msg first
   * @param {*} msg JSON `{key: 'key' || 'key1/key2/...', value: any}`
   */
  const putAll = (msg) => {
    const input = JSON.parse(msg)
    const chain = chainer(input.key, app) 
    console.log('[React node] Chain :', chain)
    chain.put(input.value, ack => {
      console.log('[GUN node] ACK: ', ack)
      native.channel.post('done', { put: ack })
    })
  }

  /**
   * Assign msg, will automatically chain a nested object
   * deprecated: gets messy since it allows for deep unstructured chains
   * @param {*} msg JSON { key1: {key2: any}, ...}
   */
  const putAllCompat = (msg) => {
    const input = JSON.parse(msg)
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

