
const store = require('./src/Store')
const createTimer = require('./src/Data').createTimer
const finishTimer = require('./src/Data').finishTimer
const getProject = require('./src/Data').getProject
const getTimers = require('./src/Data').getTimers
const getRunning = require('./src/Data').getRunning
const trimSoul = require('./src/Data').trimSoul
const { differenceInSeconds, timerRanToday } = require('./src/Functions')
const native = require('./native-bridge')

const debug = false

let timer
let runningTimer
let runningProject
let count = 0

// Core Functions

/**
 * 
 * @param {object} input 
 */
const runTimer = (running, project) => {
    debug && console.log('[Timer node] run timer ')
    clearInterval(timer)
    if (project && typeof project === 'object' && project.name) {
        native.channel.post('notify', { title: project.name, subtitle: count.toString(), state: "start" })
        timer = setInterval(() => {
            if (!running || running.status !== 'running') {
                clearInterval(timer)
                return;
            }
            // console.log('count ' + count)
            native.channel.post('count', count.toString())
            // count = count + 1
            count++
        }, 1000)
    }
}

const stopTimer = () => {
    debug && console.log('[Timer node] Stop ', runningTimer)
    clearInterval(timer)
    native.channel.post('notify', { state: "stop" })
}

// Helper Functions 
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
    if (typeof msg === 'string') return parser(msg)
    else if (typeof msg === 'object') return msg
}


const findRunningProject = running => new Promise((resolve, reject) => {
    if (!running || running.status !== 'running') {
        reject('no running timer')
    } else {
        getProject(running.project, event => {
            let item = JSON.parse(event)
            debug && console.log('[NODE_DEBUG_PUT] : Running Project ', item.id)
            if (item.type === 'project' && item.id === running.project) {
                resolve(item)
            } else {
                reject('no running project found')
            }
        })
    }
})

getCount = (data) => new Promise((resolve, reject) => {
    if (!data) reject('no data')
    else if (runningTimer && runningTimer.project !== data.project) {
        debug && console.log(`getting count ${runningTimer.project} != ${data.project}`)
        getTimers(data.project).then(timers => {
            debug && console.log(`Got timers ${typeof timers} `, timers)
            count = 0
            for (timer in timers) {
                // debug && console.log(`Got timer ${typeof timers[timer]} `, timers[timer] )
                // let foundTimer = trimSoul(timers[timer])
                let foundTimer = timers[timer]
                if (typeof foundTimer === 'string') {
                    foundTimer = JSON.parse(foundTimer)
                    // debug && console.log(`Got timer ${typeof foundTimer}`, foundTimer)
                    if (timerRanToday(foundTimer)) {
                        let TIMERTOTAL = differenceInSeconds(foundTimer.ended, foundTimer.started)
                        debug && console.log(`Got count ${foundTimer.project}/${foundTimer.id} , ${TIMERTOTAL}`)
                        count = count + TIMERTOTAL
                        debug && console.log('Updating count ', count)
                    }
                }
            }
            debug && console.log(`count ${count}`)
            resolve(count)
        })
    }
    else if (runningTimer && runningTimer.project === data.project) {
        debug && console.log(`same count ${runningTimer.project} = ${data.project}`)
        count = count
        resolve(count)
        debug && console.log(`count ${count}`)
    }
    else {
        debug && console.log(`new count ${data.project}`)
        count = 0
        resolve(count)
        debug && console.log(`count ${count}`)
    }
})

function updateRunning(runningTimer, runningProject) {
    let running = runningTimer
    running.color = runningProject.color
    running.name = runningProject.name
    native.channel.post('running', running)
}

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = JSON.parse(data)
    if (data.type === 'timer') {
        if (data.status === 'running') {
            getCount(data).then(count => {
                runningTimer = data
                debug && console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
                findRunningProject(runningTimer).then(found => {
                    runningProject = found
                    runTimer(runningTimer, runningProject)
                    updateRunning(runningTimer, runningProject) // sends to react
                })

                // debug && console.log('run timer: ', timer)
            })

        }
        else if (data.status === 'done' && data.id === runningTimer.id) {
            debug && console.log('[node STOP]')
            runningTimer = data
            stopTimer()
        }
        else if (data.id === 'none') {
            runningTimer = data
            stopTimer()
        }
        else {
            stopTimer()
        }
    }
})

// Native Commands Handler, listens to notification action buttons
native.channel.on('stop', msg => {
    debug && console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        stopTimer()
        finishTimer(runningTimer)
    } catch (error) {
        debug && console.log('[Timer node] : Stop failed ' + error)
    }
})

native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        const runningNew = createTimer(runningTimer.project)
        getCount(runningNew).then(count => {
            runningTimer = runningNew
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            findRunningProject(runningTimer).then(found => {
                runningProject = found
                runTimer(runningTimer, runningProject)
            })
            console.log('run timer: ', timer)
        })

    } catch (error) {
        console.log('[Timer node] : Create failed ' + error)
    }
})