// mini nodeified version of Functions.js
const moment = require('moment')

/**
 * 
 * reference: https://stackoverflow.com/questions/41778205/find-time-difference-between-2-times-using-moment-js
 * @param {Date} start 
 * @param {Date} end 
 */
const differenceInSeconds = (start, end) => {
    var a = moment(start)
    var b = moment(end)
    return a.diff(b, 'seconds')
}

/**
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment
 */
const startOfToday = () => {
    const now = moment()
    return now.startOf('day')
}

/**
 * 
 * @param {Date} date
 * reference https://stackoverflow.com/questions/49909213/how-to-get-the-beginning-and-end-of-the-day-with-moment 
 */
const endOfDay = (date) => {
    return moment(date).endOf('day')
}

/**
 * reference https://stackoverflow.com/questions/17333425/add-a-duration-to-a-moment-moment-js
 * @param {Date} date 
 * @param {Number} amount 
 */
const addSeconds = (date, amount) => {
    return moment(date).add(amount, 'seconds')
}

const debug = false

/**
 * 
 * @param {*} timer 
 */
exports.isRunning = timer => timer && typeof timer === 'object' && timer.status === 'running' ? true : false

/**
 * Split a timer into one timer per day
 * @param {*} started 
 * @param {*} ended
 * @return `[{start: DateTime, end: DateTime}, ...]`
 */
exports.newEntryPerDay = (started, ended) => {
    if (typeof started === 'string') started = new Date(started)
    if (typeof ended === 'string') ended = new Date(ended)
    if (!ended) ended = new Date()
    // debug && console.log(started, ended)
    const secondsinday = 86400
    let totalSeconds = differenceInSeconds(ended, started)
    // debug && console.log('total seconds', totalSeconds)
    // get whole days
    if (totalSeconds > secondsinday) {
        const output = []
        let daysfromseconds = totalSeconds / secondsinday
        let start = started
        while (daysfromseconds > 1) {
            // debug && console.log(daysfromseconds)
            let end = endOfDay(start)
            let day = { start: start.toString(), end: end.toString() }
            output.push(day)
            // debug && console.log(day)
            start = addSeconds(end, 1)
            totalSeconds = totalSeconds - secondsinday
            daysfromseconds = totalSeconds / secondsinday
            if (daysfromseconds < 1) {
                // debug && console.log(daysfromseconds)
                let end = endOfDay(start)
                let day = { start: start.toString(), end: end.toString() }
                output.push(day)
                // debug && console.log(day)
                // let last = { start: startOfToday().toString(), end: 'running' }
                let last = { start: startOfToday().toString(), end: ended.toString() }
                output.push(last)
                // debug && console.log(last)
                break
            }
        }
        return output
    } else {
        // debug && console.log('Entry Less than a day')
        return []
    }

}