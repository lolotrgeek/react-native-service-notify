const config = {
  port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
  host: 'localhost'
};
const Gun = require('gun')
const path = require('path')

const debug = false

// events
const events = require('events');
const eventEmitter = new events.EventEmitter();

config.server = require('http').createServer(Gun.serve(__dirname));

// debug && console.log('GUN config ', config)


const gun = new Gun({
  // Defaults
  web: config.server.listen(config.port, config.host),
  file: path.join(__dirname, 'radata'),

})
debug && console.log('Relay peer started on port ' + config.port + ' with /gun');

const native = require('../native-bridge');
const { node } = require('gun');
const app = gun.get('app')

/**
 * 
 * @param {*} input 
 */
const parser = input => {
  try {
    input = JSON.parse(input)
  } catch (error) {
    debug && console.log('[Parse node] not a JSON object')
  } finally {
    return input
  }
}

const inputParser = msg => {
  if (typeof msg === 'string') {
    debug && console.log('Parsing String Input')
    return parser(msg)
  }
  else if (typeof msg === 'object') {
    debug && console.log('Parsing Object Input')
    return msg
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
    debug && console.log('[Chain node] no input or chain')
    return false
  }
  input = parser(input)
  if (typeof input === 'string') {
    debug && console.log('[Chain node] Ending chain with: ', input)
    if (input.length === 0) return chain
    chain = chain.get(input)
  }
  else if (typeof input === 'object' && Object.keys(input).length > 0) {
    for (key in input) {
      debug && console.log('[Chain node] Chaining key:', key)
      let value = input[key]
      if (typeof value === 'object') {
        debug && console.log('[Chain node] Extending chain: ', value)
        chain = chain.get(key)
      }
      chainerCompat(value, chain)
    }
  }
  debug && console.log('[Chain node] done.')
  return chain
}

/**
 * removes soul from given data
 * @param {*} data 
 */
const trimSoul = data => {
  if (!data || !data['_'] || typeof data['_'] !== 'object') return data
  delete data['_']
  return data
}

/**
* Create a chain by splitting a key string, adding each split to the chain
* 
* @param {string} input `key` || `key1/key2/...`
* @param {*} chain 
*/
const chainer = (input, chain) => {
  if (!input || !chain) {
    debug && console.log('[Chain node] no input or chain')
    return false
  }

  if (typeof input === 'string') {
    if (input.length === 0) return chain
    inputKeys = input.split('/')
    // chainer(input, chain)
    // if (input.length === 0) return chain
    while (inputKeys.length > 0) {
      debug && console.log('[Chain node] Chaining key:', inputKeys[0])
      chain = chain.get(inputKeys[0])
      inputKeys = inputKeys.slice(1)
    }
  }
  debug && console.log('[Chain node] done.')
  return chain
}

const getOne = (msg) => {
  const chain = chainer(msg, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.on((data, key) => {
    debug && console.log('[GUN node] Data Found: ' + data)
    eventEmitter.emit(msg, data)
    native.channel.post('done', data)
  })
}

const getAll = (msg) => {
  const chain = chainer(msg, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.map().on((data, key) => {
    debug && console.log('[GUN node] Data Found: ', data)
    native.channel.post('done', data)
    eventEmitter.emit(msg, data)
  })
  chain.off()
}

const getAllOnce = (msg) => {
  const chain = chainer(msg, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.once().map().once((data, key) => {
    if (!data) {
      debug && console.log('[GUN node] No Data Found',)
    }
    debug && console.log('[GUN node] Data Found: ', data)
    native.channel.post('done', data)
    eventEmitter.emit(msg, data)
  })
  chain.off()
}

const getOnce = (msg, cb) => {
  const chain = chainer(msg, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.on((data, key) => { debug && console.log('Got Once ', data) })
  chain.off()
}

/**
 * Assign a value to keys, needs to parse msg first
 * @param {*} msg JSON or object`{key: 'key' || 'key1/key2/...', value: any}`
 */
const putAll = (msg) => {
  const input = inputParser(msg)
  debug && console.log('[NODE_DEBUG_PUT] : ', input)
  const chain = chainer(input.key, app)
  // debug && console.log('[React node] Chain :', chain)
  debug && console.log('[NODE_DEBUG_PUT] : ', typeof input)
  chain.put(input.value, ack => {
    debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
    native.channel.post('done', ack.err ? ack : input.value)
  })
}

/**
 * Assign a value to a set, needs to parse JSON msg first
 * @param {*} msg JSON `{key: 'key' || 'key1/key2/...', value: any}`
 */
const setAll = (msg) => {
  debug && console.log('[NODE_DEBUG_SET] : parsing - ', msg)
  const input = inputParser(msg)
  debug && console.log('[NODE_DEBUG_SET] : ', input)
  const chain = chainer(input.key, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.set(input.value, ack => {
    debug && console.log('[NODE_DEBUG_SET] ERR? ', ack.err)
    native.channel.post('done', ack.err ? ack : input.value)
  })
}

/**
 * Assign msg, will automatically chain a nested object
 * deprecated: gets messy since it allows for deep unstructured chains
 * @param {*} msg JSON { key1: {key2: any}, ...}
 */
const putAllCompat = (msg) => {
  const input = inputParser(msg)
  app.put(input, ack => {
    // debug && console.log('[GUN node] ACK: ', ack)
    native.channel.post('done', ack.err ? ack : input.value)
  })
}

const offAll = msg => {
  const input = inputParser(msg)
  const chain = chainer(input.key)
  chain.off()
}

native.channel.on('get', msg => {
  debug && console.log('[React node] incoming get: ' + typeof msg, msg)
  try {
    debug && console.log('[GUN node] Getting : ' + msg)
    getOne(msg)
  } catch (error) {
    debug && console.log('[GUN node] : Getting failed' + error)
  }
})

native.channel.on('getAll', msg => {
  debug && console.log('[React node] incoming getAll: ' + typeof msg, msg)
  try {
    debug && console.log('[GUN node] Getting All: ' + msg)
    getAll(msg)
  } catch (error) {
    debug && console.log('[GUN node] : Getting All failed ' + error)
  }
})

native.channel.on('put', msg => {
  debug && console.log('[React node] incoming put: ' + typeof msg, msg)
  try {
    debug && console.log('[React node] storing - ' + msg)
    putAll(msg)
  } catch (error) {
    debug && console.log('[GUN node] : Putting failed ' + error)
  }
})

native.channel.on('set', msg => {
  debug && console.log('[React node] incoming set: ' + typeof msg, msg)
  try {
    debug && console.log('[React node] storing - ' + msg)
    setAll(msg)
  } catch (error) {
    debug && console.log('[GUN node] : Setting failed ' + error)
  }
})

native.channel.on('off', msg => {
  debug && console.log('[React node] incoming off: ' + typeof msg, msg)
  try {
    debug && console.log('[React node] Off - ' + msg)
    offAll(msg)
  } catch (error) {
    debug && console.log('[GUN node] : Off failed ' + error)
  }
})

module.exports = {
  chainer: chainer,
  app: app,
  get: getOne,
  getOnce: getOnce,
  getAll: getAll,
  getAllOnce: getAllOnce,
  put: putAll,
  set: setAll,
  off: offAll,
  channel: eventEmitter,
};

