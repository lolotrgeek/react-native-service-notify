
const store = require('./src/Store')
const createTimer = require('./src/Data').createTimer
const finishTimer = require('./src/Data').finishTimer
const getProject = require('./src/Data').getProject
const getTimers = require('./src/Data').getTimers
const getRunning = require('./src/Data').getRunning
const trimSoul = require('./src/Data').trimSoul
const { differenceInSeconds, timerRanToday } = require('./src/Functions')
const native = require('./native-bridge')

let timer
let runningTimer
let runningProject
let count = 0
// Core Functions

/**
 * 
 * @param {object} input 
 */
const runTimer = () => {
    console.log('[Timer node] run timer ')
    clearInterval(timer)
    timer = setInterval(() => {
        if (!runningTimer || runningTimer.status !== 'running') {
            clearInterval(timer)
            return;
        }
        if (runningProject && typeof runningProject === 'object' && runningProject.name) {
            native.channel.post('notify', { title: runningProject.name, subtitle: count.toString(), state: "start" })
            count = count + 1
        }
    }, 1000)
}

const stopTimer = () => {
    console.log('[Timer node] Stop ', runningTimer)
    clearInterval(timer)
    native.channel.post('notify', { state: "stop" })
}

// Helper Functions 
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
    if (typeof msg === 'string') return parser(msg)
    else if (typeof msg === 'object') return msg
}


const findRunningProject = runningTimer => new Promise((resolve, reject) => {
    if (!runningTimer || runningTimer.status !== 'running') {
        reject(null)
    } else {
        getProject(runningTimer.project, event => {
            let item = JSON.parse(event)
            console.log('[NODE_DEBUG_PUT] : Running Project ', item.id)
            if (item.type === 'project' && item.id === runningTimer.project) {
                resolve(item)
            } else {
                reject(null)
            }
        })
    }
})

getCount = (data) => new Promise((resolve, reject) => {
    if (runningTimer && runningTimer.project !== data.project) {
        console.log(`getting count ${runningTimer.project} != ${data.project}`)
        getTimers(data.project).then(timers => {
            console.log(`Got timers ${typeof timers} `, timers)
            count = 0
            for (timer in timers) {
                // console.log(`Got timer ${typeof timers[timer]} `, timers[timer] )
                let foundTimer = trimSoul(timers[timer])
                if (typeof foundTimer === 'string') {
                    foundTimer = JSON.parse(foundTimer)
                    // console.log(`Got timer ${typeof foundTimer}`, foundTimer)
                    if (timerRanToday(foundTimer)) {
                        let TIMERTOTAL = differenceInSeconds(foundTimer.ended, foundTimer.started)
                        console.log(`Got count ${foundTimer.project}/${foundTimer.id} , ${TIMERTOTAL}`)
                        count = count + TIMERTOTAL
                        console.log('Updating count ', count)
                    }
                }
            }
            console.log(`count ${count}`)
            resolve(count)
        })
    }
    else if (runningTimer && runningTimer.project === data.project) {
        console.log(`same count ${runningTimer.project} = ${data.project}`)
        count = count
        resolve(count)
        console.log(`count ${count}`)
    }
    else {
        console.log(`new count ${data.project}`)
        count = 0
        resolve(count)
        console.log(`count ${count}`)
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
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            findRunningProject(runningTimer).then(found => {
                runningProject = found
            })
            runTimer()
            // console.log('run timer: ', timer)
           })

        }
        else if (data.status === 'done' && data.id === runningTimer.id) {
            console.log('[node STOP]')
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
    console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        stopTimer()
        finishTimer(runningTimer)
    } catch (error) {
        console.log('[Timer node] : Stop failed ' + error)
    }
})

native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        const runningNew = createTimer(runningTimer.project)
        runningTimer = runningNew
    } catch (error) {
        console.log('[Timer node] : Create failed ' + error)
    }
    try {
        runTimer()
    } catch (error) {
        console.log('[Timer node] : Start failed ' + error)
    }
})