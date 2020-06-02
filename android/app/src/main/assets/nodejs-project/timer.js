
const store = require('./src/Store')
const createTimer = require('./src/Data').createTimer
const finishTimer = require('./src/Data').finishTimer
const native = require('./native-bridge')

let timer
let runningTimer
let count
// Core Functions
/**
 * 
 * @param {object} input 
 */
// const runTimer = () => {
//     console.log('[Timer node] Start ')
//     timer = setInterval(() => {
//         if (!runningTimer || runningTimer.status !== 'running') {
//             clearInterval(timer)
//             return;
//         }
//         native.channel.post('notify', { title: runningTimer.id, subtitle: count.toString(), state: "start" })
//         count++
//     }, 1000)
// }

const runTimer = () => {
    console.log('[Timer node] Start ')
    native.channel.post('notify', { title: runningTimer.id, state: "start" })
 
}
const stopTimer = () => {
    console.log('[Timer node] Stop ', runningTimer)
    // clearInterval(timer)
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

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = JSON.parse(data)
    if (data.type === 'timer') {
        console.log('[node STOP] data: ', data)
        if (data.status === 'running') {
            count = 0
            runningTimer = data
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            runTimer()
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
        count = 0
        runTimer()
    } catch (error) {
        console.log('[Timer node] : Start failed ' + error)
    }
})