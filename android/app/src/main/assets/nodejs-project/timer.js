
const store = require('./src/Store')
const createTimer = require('./src/Data').createTimer
const finishTimer = require('./src/Data').finishTimer
const native = require('./native-bridge')

let timer
let runningTimer

// Core Functions
const runTimer = input => {
    console.log('[Timer node] Start - ' + input)
    let i = 0
    timer = setInterval(() => {
        native.channel.post('notify', { title: input.id, subtitle: i.toString(), state: "start" })
        i++
    }, 1000)
}
const stopTimer = () => {
    console.log('[Timer node] Stop ' + timer)
    clearInterval(timer)
    // runningTimer = { id: 'none' }
    native.channel.post('notify', { state: "stop" })
}

// Remote Commands Handler, listens to finishTimer or createTimer
store.chainer('running', store.app).on((data, key) => {
    data = JSON.parse(data)
    if (data.type === 'timer') {
        if (data.status === 'running') {
            runningTimer = data
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            runTimer(data)
        }
        else if (data.status !== 'running' && data.id === runningTimer.id) {
            runningTimer = { id: 'none' }
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
        console.log('[Timer node] : Stop failed' + error)
    }
})

native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        createTimer(runningTimer.id)
        // runTimer(runningTimer)
    } catch (error) {
        console.log('[Timer node] : Start failed' + error)
    }
})