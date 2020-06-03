// mini nodeified version of Data.js

const isRunning = require('./Functions').isRunning
const newEntryPerDay = require('./Functions').newEntryPerDay
const doneTimer = require('./Models').doneTimer
const newTimer = require('./Models').newTimer
const store = require('./Store')

const debug = true

const put = (key, value) => store.put({key : key, value : value})
const set = (key, value) => store.set({key : key, value : value})
const get = key => store.get(key)

const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  const timer = newTimer(projectId)
  debug && console.log('Created Timer', timer)
  put('running', JSON.stringify(timer))
  debug && console.log('Success! Created Timer.')
  set(`history/timers/${projectId}/${timer.id}`, JSON.stringify(timer))
  return timer
}

const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  set(`history/timers/${timer.project}/${timer.id}`, JSON.stringify(timer))
  put(`timers/${timer.project}/${timer.id}`, JSON.stringify(timer))
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 * @param {Object} value a timer object
 */
const addTimer = (projectId, value) => {
  const timer = cloneTimer(value)
  debug && console.log('[react Data] Storing Timer', timer)
  set(`history/timers/${projectId}/${timer.id}`, JSON.stringify(timer))
  put(`timers/${projectId}/${timer.id}`, JSON.stringify(timer))
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
                else { addTimer(splitTimer.project, splitTimer) }
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
  store.channel.addListener('done', handler)
}


module.exports = {
  finishTimer : finishTimer,
  createTimer : createTimer,
  getProject : getProject
}