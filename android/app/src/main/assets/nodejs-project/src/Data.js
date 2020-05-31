// mini nodeified version of Data.js

const isRunning = require('./Functions').isRunning
const newEntryPerDay = require('./Functions').newEntryPerDay
const doneTimer = require('./Models').doneTimer
const newTimer = require('./Models').newTimer
const store = require('./Store')
const debug = true

const put = (key, value) => store.put({key : key, value : value})
const set = (key, value) => store.set({key : key, value : value})

const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  const timer = newTimer(projectId)
  debug && console.log('Created Timer', timer)
  put('running', timer)
  set(`history/timers/${projectId}/${timer.id}`, timer)
  return true
}

const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  set(`history/timers/${timer.project}/${timer.id}`, timer)
  put(`timrs/${timer.project}/${timer.id}`, timer)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 * @param {Object} value a timer object
 */
const addTimer = (projectId, value) => {
  const timer = cloneTimer(value)
  debug && console.log('[react Data] Storing Timer', timer)
  set(`history/timers/${projectId}/${timer.id}`, timer)
  put(`timers/${projectId}/${timer.id}`, timer)
}

const finishTimer = (timer) => {
    if (isRunning(timer)) {
        debug && console.log('Finishing', timer)
        let done = doneTimer(timer)
        put('running', { id: 'none' })
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

module.exports = {
  finishTimer : finishTimer,
  createTimer : createTimer,
}