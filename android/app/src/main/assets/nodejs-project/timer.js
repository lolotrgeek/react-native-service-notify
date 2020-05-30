
const store = require('./src/Store')
const native = require('./native-bridge')

let timer
let runningTimer

const runTimer = input => {
    console.log('[Timer node] Start - ' + input)
    let i = 0
    timer = setInterval(() => {
        native.channel.post('notify', { title: input.id, subtitle: i.toString() })
        i++
    }, 1000)
}

const isRunning = timer => timer && typeof timer === 'object' && timer.status === 'running' ? true : false

const endTimer = (timer) => {
    debug && console.log('Ending', timer)
    store.set(`history/timers/${timer.project}/${timer.id}`, timer)
    store.put(`timrs/${timer.project}/${timer.id}`, timer)
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
        } else {
            endTimer(done)
        }
    } else { return timer }
}

const stopTimer = () => {
    console.log('[Timer node] Stop ' + timer)
    clearInterval(timer)
    finishTimer(runningTimer)
    runningTimer = { id: 'none' }
    native.channel.post('notify', {state: "stop"})
}

store.chainer('running', store.app).on((data, key) => {
    data = JSON.parse(data)
    if (data.type === 'timer') {
        if (data.status === 'running') {
            runningTimer = data
            console.log('[NODE_DEBUG_PUT] : Running Timer ', runningTimer)
            runTimer(data)
        }
        if (data.status !== 'running' && data.id === runningTimer.id) {
            stopTimer()
        }
    }
})

native.channel.on('stop', msg => {
    console.log('[React node] incoming Stop: ' + typeof msg, msg)
    try {
        stopTimer()
    } catch (error) {
        console.log('[Timer node] : Stop failed' + error)
    }
})

native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg, msg)
    try {
        runTimer(runningTimer)
    } catch (error) {
        console.log('[Timer node] : Start failed' + error)
    }
})