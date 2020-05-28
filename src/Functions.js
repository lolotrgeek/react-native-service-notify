import { isValid, isSameDay, isDate, differenceInSeconds, startOfToday, compareAsc, isToday, isYesterday, addSeconds, endOfDay, addMinutes, parseISO, format } from 'date-fns'
import moment from 'moment'

const debug = false


// TODO: REFACTOR SO FUNCTIONS DO NOT NEED ANY DATA STRUCTURE
// DATA FUNCTIONS
/**
 * removes soul from given data
 * @param {*} data 
 */
export const trimSoul = data => {
    if (!data || !data['_'] || typeof data['_'] !== 'object') return data
    delete data['_']
    return data
}

// TIME FUNCTIONS
/**
 * Create a date String of Today
 */
export const dateCreator = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
}
/**
 * Convert seconds to string `hh : mm : ss`
 * @param {number} seconds 
 */
// export const secondsToString = seconds => moment("2015-01-01").startOf('day').seconds(seconds).format('H:mm:ss');
//TODO consider shorthanding this
export const secondsToString = seconds => {
    let day = moment("2015-01-01")
    let start = day.startOf('day')
    let second = start.seconds(seconds)
    return moment.isMoment(second) ? second.format('H:mm:ss') : null
};

/**
 * return full month name from date.
 * @param {*} date
 */
export const getMonth = date => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    return monthNames[date.getMonth()]
}
/**
 * return date as a simplifed date string `dd month yyy`
 * @param {*} date 
 */
export const simpleDate = date => format(date, "MMM d yyyy")
export const simpleDateOld = date => date.getDate() + " " + getMonth(date) + " " + date.getFullYear()

export const fullDate = date => format(date, "EEE MMM d yyyy  hh:mm:ss aaa")
export const fullDay = date => format(date, "EEE MMM d yyyy")
/**
 * 
 */
export const listDay = timers => timers.map(timer => new Date(timer[1].started))
/**
 * 
 * @param {*} start 
 * @param {*} end 
 */
export const timeRules = (start, end) => compareAsc(start, end) === 1 ? false : true
/**
 * 
 * @param {*} date 
 */
export const dateRules = date => compareAsc(date, new Date()) === 1 ? false : date

/**
 * 
 * @param {*} date 
 */
export const timeString = date => isDate(date) ? date.toTimeString().split(' ')[0] : date
/**
 * get number of seconds between two dates
 * @param {*} start 
 * @param {*} end 
 */
export const totalTime = (start, end) => differenceInSeconds(new Date(end), new Date(start))
/**
 * display start and end times
 * @param {*} start 
 * @param {*} end 
 */
export const timeSpan = (start, end) => timeString(new Date(start)) + ' - ' + timeString(new Date(end))
/**
 * 
 * @param {*} start 
 * @param {*} end 
 */
export const totalOver = (start, end) => Math.sign(end) === -1 ? start + end : 0
/**
 * 
 * @param {*} timers 
 */
export const totalProjectTime = timers => timers.reduce((acc, timer) => acc + timer.total)
/**
 * 
 * @param {*} datestring 
 */
export const sayDay = datestring => isToday(new Date(datestring)) ? 'Today' : isYesterday(new Date(datestring)) ? 'Yesterday' : datestring
/**
 * 
 * @param {*} t timestring or date object
 */
export const formatTime = t => {
    if (t >= 0) return new Date(t * 1000).toISOString().substr(11, 8)  // hh : mm : ss
    else {
        t = Math.abs(t)
        t = t.toString()
        if (t.length === 0) return '00:00:00'
        if (t.length === 1) return '-00:00:0' + t.charAt(0)
        if (t.length === 2) return '-00:00:' + t.charAt(0) + t.charAt(1)
        if (t.length === 3) return '-00:0' + t.charAt(0) + ':' + t.charAt(1) + t.charAt(2)
        if (t.length === 4) return '-00:' + t.charAt(0) + t.charAt(1) + ':' + t.charAt(2) + t.charAt(3)
        if (t.length === 5) return '-0' + t.charAt(0) + ':' + t.charAt(1) + t.charAt(2) + ':' + t.charAt(3) + t.charAt(4)
        if (t.length > 5) return '-' + t.charAt(0) + t.charAt(1) + ':' + t.charAt(2) + t.charAt(3) + ':' + t.charAt(4) + t.charAt(5)
    }
}

// TIMER FUNCTIONS - WIP
/**
 * 
 * @param {*} timer 
 */
export const sayRunning = timer => timer[1].ended === timer[1].started ? 'running' : timer[1].ended
/**
 * 
 * @param {*} timer 
 */
export const isRunning = timer => timer && typeof timer[1] === 'object' && timer[1].status === 'running' ? true : false
/**
 * Get amount of time since entry was started
 * @param {string} started datestring when entry was started
 */
export const elapsedTime = started => differenceInSeconds(new Date(), new Date(started))
/**
 * find running timers within given days
 * @param {*} days 
 */
export const runningFind = async days => new Promise((resolve, reject) => {
    let found = days.map(day => day.data.filter(timers => isRunning(timers) ? timers : false))
    found.length > 0 ? resolve(found) : reject([])
})
/**
 * find running timers within given timers
 * @param {*} timers 
 */
export const findRunning = timers => {
    const foundRunning = timers.filter(timer => {
        if (timer[1].status === 'running') {
            return true
        } else {
            return false
        }
    })
    if (foundRunning && foundRunning.length === 1) {
        // debug && console.log('foundRunning : ', foundRunning[0])
        return foundRunning[0]
    }
    else if (foundRunning.length > 1) {
        // debug && console.log('foundRunning - multiple running :', foundRunning)
        foundRunning.map(found => found)
        return []
    }
    else {
        // debug && console.log('foundRunning - no valid : ', foundRunning)
        return []
    }
}
/**
 * 
 * @param {*} started 
 * @param {*} ended 
 */
export const multiDay = (started, ended) => {
    if (typeof started === 'string') started = new Date(started)
    if (typeof ended === 'string') ended = new Date(ended)
    if (!ended) ended = new Date()
    return isSameDay(started, ended) ? false : true
}

/**
 * Split a timer into one timer per day
 * @param {*} started 
 * @param {*} ended
 * @return `[{start: DateTime, end: DateTime}, ...]`
 */
export const newEntryPerDay = (started, ended) => {
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

// STYLE FUNCTIONS
/**
 * 
 * @param {*} mood 
 */
export const moodMap = mood => {
    if (mood === '') return { name: 'times', color: 'black' }
    if (mood === 'great') return { name: 'grin', color: 'orange' }
    if (mood === 'good') return { name: 'smile', color: 'green' }
    if (mood === 'meh') return { name: 'meh', color: 'purple' }
    if (mood === 'bad') return { name: 'frown', color: 'blue' }
    if (mood === 'dizzy') return { name: 'awful', color: 'grey' }
}

// SORTING FUNCTIONS
/**
 * List all timers in each day
 * @param {*} timerlist 
 * @returns [{title: day, data: [timer, ...]}, ...]
 */
export const dayHeaders = timerlist => {
    const output = [] // [days...]
    // organize timers by day
    const timerdays = timerlist.map(timer => {
        return { day: simpleDateOld(new Date(timer[1].started)), timer: timer }
    })
    // //// debug && console.log(pagename + '- DAYHEADERS - TIMERDAYS : ', timerdays)
    timerdays.forEach(timerday => {
        // first value if output is empty is always unique
        if (output.length === 0) {
            // // debug && console.log('FIRST OUTPUT ENTRY :', timerday)
            output.push({ title: timerday.day, data: [timerday.timer] })
        }
        else {
            // find and compare timerdays to outputs
            const match = output.find(inOutput => inOutput.title === timerday.day)
            if (match) {
                //// debug && console.log(pagename + '- MATCHING ENTRY :', match.title)
                // add timer to list of timers for matching day
                match.data = [...match.data, timerday.timer]
            }
            else {
                //// debug && console.log(pagename + '- NEW OUTPUT ENTRY :', timerday)
                output.push({ title: timerday.day, data: [timerday.timer] })
            }
        }
    })
    // // debug && console.log('- DAYHEADERS - OUTPUT', output)
    if (output.length > 0) { return (output) }
    else { return ([]) }
}

/**
 * takes timers sorted by day and combines by project then sums total time 
 * @param {Array} dayheaders {title: day, data: [timer, ...]}
 */
export const sumProjectTimers = dayheaders => {
    return dayheaders.map(day => {
        // return array of days by project with timers summed
        let projects = []
        // for each day...
        day.data.map(timer => {
            // ... group timer entries by project
            if (projects.length === 0) {
                // debug && console.log('first timer: ', )
                // // debug && console.log('ticked : ',  timer[1].total, 'calculated : ', totalTime(timer[1].started, timer[1].ended))
                let total = totalTime(timer[1].started, timer[1].ended)
                projects.push({ project: timer[1].project, totals: [total], total: total, status: timer[1].status, timers: [timer[0]] })
            }
            // for each project get all timer entries and sum the totals
            const match = projects.find(inProjects => inProjects.project === timer[1].project)
            // // debug && console.log('projects : ', projects)
            if (match) {
                if (projects[0].timers[0] === timer[0]) {
                    // debug && console.log('existing match')
                } else {
                    // // debug && console.log('ticked : ',  timer[1].total, 'calculated : ', totalTime(timer[1].started, timer[1].ended))
                    let total = totalTime(timer[1].started, timer[1].ended)
                    match.totals = [...match.totals, total]
                    // debug && console.log('new match')
                    match.total = match.totals.reduce((acc, val) => acc + val) // sum the totals
                }
            }
            else {
                // debug && console.log('last timer: ', timer[0])
                // // debug && console.log('ticked : ',  timer[1].total, 'calculated : ', totalTime(timer[1].started, timer[1].ended))
                let total = totalTime(timer[1].started, timer[1].ended)
                projects.push({ project: timer[1].project, totals: [total], total: total, status: timer[1].status })
            }
            // debug && console.log(projects)
            return projects
        })
        // // debug && console.log({title: day.title , data : projects})
        return { title: day.title, data: projects }
    })

}