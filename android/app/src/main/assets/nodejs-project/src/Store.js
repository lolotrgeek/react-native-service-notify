const config = {
  port: process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8765,
  host: 'localhost'
};
const Gun = require('gun')
const path = require('path')

// events
const events = require('events');
const eventEmitter = new events.EventEmitter();

config.server = require('http').createServer(Gun.serve(__dirname));

// console.log('GUN config ', config)


const gun = new Gun({
  // Defaults
  web: config.server.listen(config.port, config.host),
  file: path.join(__dirname, 'radata'),

})
console.log('Relay peer started on port ' + config.port + ' with /gun');

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
    console.log('[Parse node] not a JSON object')
  } finally {
    return input
  }
}

const inputParser = msg => {
  if (typeof msg === 'string') {
    console.log('Parsing String Input')
    return parser(msg)
  }
  else if (typeof msg === 'object') {
    console.log('Parsing Object Input')
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
    console.log('[Chain node] no input or chain')
    return false
  }

  if (typeof input === 'string') {
    if (input.length === 0) return chain
    inputKeys = input.split('/')
    // chainer(input, chain)
    // if (input.length === 0) return chain
    while (inputKeys.length > 0) {
      console.log('[Chain node] Chaining key:', inputKeys[0])
      chain = chain.get(inputKeys[0])
      inputKeys = inputKeys.slice(1)
    }
  }
  console.log('[Chain node] done.')
  return chain
}

const getOne = (msg) => {
  const chain = chainer(msg, app)
  // console.log('[React node] Chain :', chain)
  chain.on((data, key) => {
    console.log('[GUN node] Data Found: ' + data)
    eventEmitter.emit(msg, data)
    native.channel.post('done', data)
  })
}

const getAll = (msg) => {
  const chain = chainer(msg, app)
  // console.log('[React node] Chain :', chain)
  chain.map().on((data, key) => {
    console.log('[GUN node] Data Found: ', data)
    native.channel.post('done', data)
    eventEmitter.emit(msg, data)
  })
  chain.off()
}

const getAllOnce = (msg) => {
  const chain = chainer(msg, app)
  // console.log('[React node] Chain :', chain)
  chain.once().map().once((data, key) => {
    if(!data) {
      console.log('[GUN node] No Data Found',)
    }
    console.log('[GUN node] Data Found: ', data)
    native.channel.post('done', data)
    eventEmitter.emit(msg, data)
  })
  chain.off()
}

/**
 * Assign a value to keys, needs to parse msg first
 * @param {*} msg JSON or object`{key: 'key' || 'key1/key2/...', value: any}`
 */
const putAll = (msg) => {
  const input = inputParser(msg)
  console.log('[NODE_DEBUG_PUT] : ', input)
  const chain = chainer(input.key, app)
  // console.log('[React node] Chain :', chain)
  console.log('[NODE_DEBUG_PUT] : ', typeof input)
  chain.put(input.value, ack => {
    console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
    native.channel.post('done', ack.err ? ack : input.value)
  })
}

/**
 * Assign a value to a set, needs to parse JSON msg first
 * @param {*} msg JSON `{key: 'key' || 'key1/key2/...', value: any}`
 */
const setAll = (msg) => {
  console.log('[NODE_DEBUG_SET] : parsing - ', msg)
  const input = inputParser(msg)
  console.log('[NODE_DEBUG_SET] : ', input)
  const chain = chainer(input.key, app)
  // console.log('[React node] Chain :', chain)
  chain.set(input.value, ack => {
    console.log('[NODE_DEBUG_SET] ERR? ', ack.err)
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
    // console.log('[GUN node] ACK: ', ack)
    native.channel.post('done', ack.err ? ack : input.value)
  })
}

const offAll = msg => {
  const input = inputParser(msg)
  const chain = chainer(input.key)
  chain.off()
}

native.channel.on('get', msg => {
  console.log('[React node] incoming get: ' + typeof msg, msg)
  try {
    console.log('[GUN node] Getting : ' + msg)
    getOne(msg)
  } catch (error) {
    console.log('[GUN node] : Getting failed' + error)
  }
})

native.channel.on('getAll', msg => {
  console.log('[React node] incoming getAll: ' + typeof msg, msg)
  try {
    console.log('[GUN node] Getting All: ' + msg)
    getAll(msg)
  } catch (error) {
    console.log('[GUN node] : Getting All failed' + error)
  }
})

native.channel.on('put', msg => {
  console.log('[React node] incoming put: ' + typeof msg, msg)
  try {
    console.log('[React node] storing - ' + msg)
    putAll(msg)
  } catch (error) {
    console.log('[GUN node] : Putting failed' + error)
  }
})

native.channel.on('set', msg => {
  console.log('[React node] incoming set: ' + typeof msg, msg)
  try {
    console.log('[React node] storing - ' + msg)
    setAll(msg)
  } catch (error) {
    console.log('[GUN node] : Setting failed' + error)
  }
})

native.channel.on('off', msg => {
  console.log('[React node] incoming off: ' + typeof msg, msg)
  try {
    console.log('[React node] Off - ' + msg)
    offAll(msg)
  } catch (error) {
    console.log('[GUN node] : Off failed' + error)
  }
})

module.exports = {
  chainer: chainer,
  app: app,
  get: getOne,
  getAll: getAll,
  getAllOnce : getAllOnce,
  put: putAll,
  set: setAll,
  off: offAll,
  channel : eventEmitter,
};

