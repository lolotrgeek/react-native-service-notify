// mini nodeified version of Data.js
const isRunning = require('./Functions').isRunning
const newEntryPerDay = require('./Functions').newEntryPerDay
const dateSimple = require('./Functions').dateSimple
const doneTimer = require('./Models').doneTimer
const newTimer = require('./Models').newTimer
const store = require('./Store')

const debug = false

const put = (key, value) => store.put({ key: key, value: value })
const set = (key, value) => store.set({ key: key, value: value })
const get = (key) => store.get(key)
const getAll = (key) => store.getAll(key)
const getAllOnce = (key) => store.getAllOnce(key)

const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  let timer = newTimer(projectId)
  let timerToString = JSON.stringify(timer)
  debug && console.log('Created Timer', timer)
  put('running', timerToString, 'running')
  debug && console.log('Success! Created Timer.')
  set(`history/timers/${projectId}/${timer.id}`, timerToString)
  return timer
}

const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  timer = JSON.stringify(timer)
  set(`history/timers/${timer.project}/${timer.id}`)
  put(`timers/${timer.project}/${timer.id}`)
  store.put(`timers/${timer.id}`, timer)
  store.put(`timers/project/${timer.project}/${timer.id}`, timer)
  store.put(`timers/date/${dateSimple(timer.started)}/${timer.id}`, timer)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 */
const addTimer = timer => {
  const clonedTimer = cloneTimer(timer)
  debug && console.log('[node Data] Storing Timer', clonedTimer)
  endTimer(clonedTimer)
}

const finishTimer = (timer) => {
  if (isRunning(timer)) {
    let done = doneTimer(timer)
    debug && console.log('[node Data STOP]', done)
    put('running', JSON.stringify(done))
    // Danger of data loss until endTimer is called
    if (multiDay(done.started, done.ended)) {
      const dayEntries = newEntryPerDay(done.started, done.ended)
      dayEntries.map((dayEntry, i) => {
        let splitTimer = done
        splitTimer.started = dayEntry.start
        splitTimer.ended = dayEntry.end
        debug && console.log('Split', i, splitTimer)
        if (i === 0) { endTimer(splitTimer) } // use initial timer id for first day
        else { addTimer(splitTimer) }
        return splitTimer
      })
    } else { endTimer(done) }
  } else { return timer }
}

/**
 * 
 * @param {string} projectId 
 * @param {function} handler 
 */
const getProject = (projectId, handler) => {
  get(`projects/${projectId}`)
  store.channel.addListener(`projects/${projectId}`, handler)
}

/**
 * Get timers today, filter out timers not in project
 * @param {*} projectId 
 */
const getTimers = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      const chain = store.chainer(`timers/date/${dateSimple()}`, store.app)
      chain.once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getTimers Data Found: ', foundData)
        let dataFiltered = []
        for (id in foundData) {
          let item = store.parse(foundData[id])
          debug && console.log('getTimers item', item)
          if (item['project'] === projectId) {
            dataFiltered.push(item)
          }
        }
        debug && console.log('[GUN node] getTimers Data Resolving: ', dataFiltered)
        resolve(dataFiltered)
      })
      // console.log('[React node] Chain :', chain)
      // chain.once((data, key) => resolve(data))
    } catch (err) {
      reject(err)
    }

  })
}

/**
 * Gets every timer in DB, then filters
 * @param {*} projectId 
 */
const getTimersFiltered = (projectId) => {
  return new Promise((resolve, reject) => {
    try {
      const chain = store.chainer('timers', store.app)
      chain.once((data, key) => {
        const foundData = trimSoul(data)
        debug && console.log('[GUN node] getTimers Data Found: ', foundData)
        let dataFiltered = []
        for (id in foundData) {
          let item = store.parse(foundData[id])
          debug && console.log('getTimers item', item)
          if (item['project'] === projectId) {
            dataFiltered.push(item)
          }
        }
        debug && console.log('[GUN node] getTimers Data Resolving: ', dataFiltered)
        resolve(dataFiltered)
      })
      // console.log('[React node] Chain :', chain)
      // chain.once((data, key) => resolve(data))
    } catch (err) {
      reject(err)
    }

  })
}

const getRunning = handler => {
  getAll('running')
  store.channel.addListener('running', handler)
}

const trimSoul = data => {
  if (!data || !data['_'] || typeof data['_'] !== 'object') return data
  delete data['_']
  return data
}

module.exports = {
  finishTimer: finishTimer,
  createTimer: createTimer,
  getProject: getProject,
  getTimers: getTimers,
  getRunning: getRunning,
  trimSoul: trimSoul
}