// mini nodeified version of Models.js

const Hashids = require('hashids/cjs')

exports.newTimer = projectId => {
    const hashids = new Hashids()
    const key = hashids.encode(Date.now().toString())
    const start = new Date().toString()
    const timer = {
        id: key,
        created: start,
        started: start,
        ended: '',
        type: 'timer',
        project: projectId,
        status: 'running',
        edited: '',
        total: 0,
        mood: 'good',
        energy: 50,
    }
    return timer
}

exports.doneTimer = (timer) => {
    const done = timer
    done.ended = new Date().toString()
    done.status = 'done'
    return done
}


exports.cloneTimer = timer => {
    const hashids = new Hashids()
    let clone = timer
    timer.id = hashids.encode(Date.now().toString())
    return clone
}