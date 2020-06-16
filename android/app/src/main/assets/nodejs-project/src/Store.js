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
 * @returns {object | undefined} 
 */
const parse = (input) => {
  let output
  if (typeof input === 'string') {
    try { output = JSON.parse(input) }
    catch (error) { console.error(error) }
  } else if (typeof input === 'object') {
    output = input
  }
  return output
}

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
    let inputKeys = input.split('/')
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

/**
 * uses first key in a key string as channel
 * @param {string} input `key` || `key1/key2/...`
 */
const channelSet = (input) => {
  let channel = 'done' // default value
  if (!input || typeof input !== 'string') {
    debug && console.log('[Channel node] no input')
    return channel
  }
  let inputKeys = input.split('/')
  if (inputKeys.length === 0) {
    debug && console.log('[Chain node] Channel key:', input)
    channel = input
  }
  else {
    debug && console.log('[Chain node] Channel key:', inputKeys[0])
    channel = inputKeys[0]
  }
  return channel
}

const getOne = (msg) => {
  const input = inputParser(msg)
  console.log('msg from android', input)
  const chain = chainer(input, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.once((data, key) => {
    const foundData = trimSoul(data)
    debug && console.log('[GUN node] getOne Data Found: ', foundData)
    console.log('msg found', foundData)
    eventEmitter.emit(msg, foundData)
    native.channel.post(input, foundData)
  })
}

const getAll = (msg) => {
  const input = inputParser(msg)
  console.log('getAll input', input)
  const chain = chainer(input.key, app)
  const filter = JSON.parse(input.filter)
  chain.once((data, key) => {
    const foundData = trimSoul(data)
    console.log('[GUN node] getAll Data Found: ', foundData)
    let dataFiltered = []
    for (id in foundData) {
      let item = parse(foundData[id])
      console.log('getAll item', item)
      if (item[filter.key]) {
        console.log('getAll key', item[filter.key])
        if (item[filter.key] === filter.value) {
          dataFiltered.push(item)
        }
      }
    }
    console.log('[GUN node] getAll Data Sending: ', dataFiltered)
    native.channel.post(input.key, dataFiltered)
    eventEmitter.emit(input.key, dataFiltered)
  })
}

/**
 * `NOT WORKING`
 * Uses Gun map function to filter
 * 
 * Could be optimization if getAll is too slow
 * @param {*} msg 
 */
const getAllFilter = (msg) => {
  const input = inputParser(msg)
  console.log('getAll input', input)
  const chain = chainer(input.key, app)
  const filter = JSON.parse(input.filter)
  chain.once((data, key) => {
    debug && console.log('[React node] Chain :', chain)
    chain.map(found => {
      console.log('getAll item', item)
      let item = parse(found)
      console.log('getAll key', item[filter.key])
      return item[filter.key] === filter.value ? item : undefined
    }).once((data, key) => {
      const foundData = trimSoul(data)
      console.log('[GUN node] getAll Data Found: ', foundData)
      native.channel.post(input.key, foundData)
      eventEmitter.emit(input.key, foundData)
    })

    console.log('[GUN node] getAll Data Sending: ', dataFiltered)
    native.channel.post(input.key, dataFiltered)
    eventEmitter.emit(input.key, dataFiltered)
  })
}

const getAllOnce = (msg) => {
  const input = inputParser(msg)
  const chain = chainer(input, app)
  // debug && console.log('[React node] Chain :', chain)
  chain.once().map().once((data, key) => {
    if (!data) {
      debug && console.log('[GUN node] getAllOnce No Data Found',)
    }
    data = trimSoul(data)
    debug && console.log('[GUN node] getAllOnce Data Found: ', data)
    native.channel.post(input, data)
    eventEmitter.emit(msg, data)
  })
  chain.off()
}

/**
 * Local node `get` function
 * @param {*} msg 
 * @param {*} cb 
 */
const getOnce = (msg, cb) => {
  const chain = chainer(msg, app)
  // debug && console.log('[React node] Chain :', chain)
  data = trimSoul(data)
  chain.on((data, key) => { debug && console.log('Got Once ', data) })
  chain.off()
}

/**
 * Assign a value to keys, needs to parse msg first
 * @param {*} msg JSON or object
 * @param {string} msg.key `key` or `key1/key2/...`
 * @param {*} msg.value any
 * @param {string} [channel] optional channel name, default name `done`
 */
const putAll = (msg) => {
  const input = inputParser(msg)
  debug && console.log('[NODE_DEBUG_PUT] : ', input)
  const chain = chainer(input.key, app)
  // debug && console.log('[React node] Chain :', chain)
  debug && console.log('[NODE_DEBUG_PUT] : ', typeof input)
  chain.put(input.value, ack => {
    const data = trimSoul(input.value)
    debug && console.log('[NODE_DEBUG_PUT] ERR? ', ack.err)
    native.channel.post('put', ack.err ? ack : data)
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
    const data = trimSoul(input.value)
    debug && console.log('[NODE_DEBUG_SET] ERR? ', ack.err)
    native.channel.post('set', ack.err ? ack : data)
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
  parse: parse,
};

