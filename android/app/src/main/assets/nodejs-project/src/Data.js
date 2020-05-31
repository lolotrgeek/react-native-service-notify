// mini nodeified version of Data.js

const isRunning = require('./Functions').isRunning
const newEntryPerDay = require('./Functions').newEntryPerDay
const doneTimer = require('./Models').doneTimer
const newTimer = require('./Models').newTimer
const debug = true

const createTimer = (projectId) => {
  if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
  debug && console.log('Creating Timer', projectId)
  const timer = newTimer(projectId)
  debug && console.log('Created Timer', timer)
  store.put('running', timer)
  store.set(`history/timers/${projectId}/${timer.id}`, timer)
  return true
}

const endTimer = (timer) => {
  debug && console.log('Ending', timer)
  store.set(`history/timers/${timer.project}/${timer.id}`, timer)
  store.put(`timrs/${timer.project}/${timer.id}`, timer)
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 * @param {Object} value a timer object
 */
const addTimer = (projectId, value) => {
  const timer = cloneTimer(value)
  debug && console.log('[react Data] Storing Timer', timer)
  store.set(`history/timers/${projectId}/${timer.id}`, timer)
  store.put(`timers/${projectId}/${timer.id}`, timer)
}

const finishTimer = (timer) => {
    if (isRunning(timer)) {
        debug && console.log('Finishing', timer)
        let done = doneTimer(timer)
        store.put('running', { id: 'none' })
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