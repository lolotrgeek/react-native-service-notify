// mini nodeified version of Data.js

const isRunning = require('./Functions').isRunning
const isToday = require('./Functions').isToday
const newEntryPerDay = require('./Functions').newEntryPerDay
const formatDate = require('./Functions').formatDate
const doneTimer = require('./Models').doneTimer
const newTimer = require('./Models').newTimer
const store = require('./Store')

const debug = true

const put = (key, value) => store.put({key : key, value : value})
const set = (key, value) => store.set({key : key, value : value})
const get = key => store.get(key)
const getAll = key => store.getAll(key)

const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  let timer = newTimer(projectId)
  timer = JSON.stringify(timer)
  debug && console.log('Created Timer', timer)
  put('running', timer)
  debug && console.log('Success! Created Timer.')
  set(`history/timers/${projectId}/${timer.id}`, timer)
  return timer
}

const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  timer = JSON.stringify(timer)
  set(`history/timers/${timer.project}/${timer.id}`, timer)
  put(`timers/${timer.project}/${timer.id}`, timer)
  // organizing...
  // put(`${timer.project}/timers`, timer.id)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 * @param {Object} value a timer object
 */
const addTimer = (projectId, value) => {
  let timer = cloneTimer(value)
  timer = JSON.stringify(timer)
  debug && console.log('[react Data] Storing Timer', timer)
  set(`history/timers/${projectId}/${timer.id}`, timer)
  put(`timers/${projectId}/${timer.id}`, timer)
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
  store.channel.addListener(`projects/${projectId}`, handler)
}

const getTimers = (projectId, handler) => {
  getAll(`timers/${projectId}`)
  store.channel.addListener(`timers/${projectId}`, handler)
}

const getRunning = handler => {
  getAll('running')
  store.channel.addListener('running', handler)
}

module.exports = {
  finishTimer : finishTimer,
  createTimer : createTimer,
  getProject : getProject,
  getTimers : getTimers,
  getRunning : getRunning
}