const main = require('./main')

let timer
let runningTimer

const runTimer = input => {
    let i = 0
    timer = setInterval(() => {
        main.native.channel.post('notify', { title: input.id, subtitle: i.toString() })
        i++
    }, 1000)
}

const stopTimer = () => {
    clearInterval(timer)
    runningTimer = {}
    main.put({key :'running', value: {id: 'none'}})
    main.native.channel.post('notify', {})
}

main.chainer('running', main.app).on((data, key) => {
    if (data.type === 'timer') {
        if (data.status === 'running') {
            runningTimer = data
            runTimer(data)
        }
        if (data.status !== 'running' && data.id === runningTimer.id) {
            stopTimer()
        }
    }
})

main.native.channel.on('stop', msg => {
    console.log('[React node] incoming Stop: ' + typeof msg + msg)
    try {
        console.log('[React node] Stop - ' + msg)
        stopTimer()
    } catch (error) {
        console.log('[GUN node] : Stop failed' + error)
    }
})

main.native.channel.on('start', msg => {
    console.log('[React node] incoming Start: ' + typeof msg + msg)
    try {
        console.log('[React node] Start - ' + msg)
        runTimer(runningTimer)
    } catch (error) {
        console.log('[GUN node] : Start failed' + error)
    }
})