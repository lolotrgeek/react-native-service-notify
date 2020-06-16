// Handlers for event listeners
// A Handler consumes an event and some state, applies conditions, then updates state 
import * as Data from './Data'
import { parse } from './Functions'

const debug = false

export const handleEvent = event => Data.trimSoul(parse(event))


export const putHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful put.')
    let item = handleEvent(event)
    debug && console.log('put ' + typeof item + ' ', item)
    if (item.type === 'timer') {
        debug && console.log('[react] timer.')
        if (item.status === 'running') {
            // state.setRunning(item)
            state.running.current = item
            debug && console.log('[react] running')
            debug && console.log(running)
            Data.getProject(item.project)
        }
        else if (item.status === 'done' && item.id === state.running.current.id) {
            debug && console.log('[react] STOP')
            debug && console.log(item)
            // state.setRunning(item)
            state.running.current = item
        }
        // state.setTimers(timers => [...timers, item])
    }
}

/**
 * Parsing found timer, updating state
 * @param {*} found 
 */
export const timerParse = (found, state) => {
    try {
        // console.log(`item ${typeof found}`, found)
        if (found.type === 'timer') {
            let alreadyFound = state.timers.some(timer => timer.id === found.id)
            if (!alreadyFound) {
                state.setTimers(timers => [...timers, found])
            }
            if (found.status === 'running') {
                running.current = found
                debug && console.log('[react] running')
                debug && console.log(running)
                // Data.getProject(item.project)
            }
            else if (found.status === 'done' && found.id === state.running.current.id) {
                debug && console.log('[react] STOP')
                debug && console.log(found)
                state.running.current = found
            }
        }
    } catch (error) {
        console.log(error)
    }
}

export const runningHandler = (event, state) => {
    let item = JSON.parse(event)
    if (item && typeof item === 'object' && typeof item === 'object' && item.status === 'running') {
      state.running.current = item
    }
    debug && console.log('[react] running')
    debug && console.log(running)
}


export const timerHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timer get.')
    let item = parse(event)
    debug && console.log('timer get ' + typeof item + ' ', item)
    timerParse(item, state)
}

export const timersHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg timers get.')
    let item = parse(event)
    debug && console.log('timers get ' + typeof item + ' ', item)
    if (Array.isArray(item)) {
        item.map(found => {
            timerParse(parse(found), state)
        })
    }
    else if (typeof item === 'object') {
        for (id in item) {
            let found = parse(item[id])
            timerParse(parse(found), state)
        }

    }
}
export const projectParse = (found, state) => {
    try {
        if (found.type === 'project') {
            let alreadyInProjects = state.projects.some(project => project.id === found.id)
            if (!alreadyInProjects) {
                state.setProjects(projects => [...projects, found])
            }
            // if (state.running.current.project && item.id === state.running.current.project) {
            //   state.running.current.color = item.color
            //   state.running.current.name = item.name
            // }

        }
    } catch (error) {
        console.log(error)
    }
}

export const projectHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] msg project get.')
    let item = parse(event)
    debug && console.log('project get ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        let found = parse(item)
        projectParse(parse(found), state)
    }
}

export const projectsHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful projects get.')
    let item = parse(event)
    debug && console.log('get ' + typeof item + ' ', item)
    if (typeof item === 'object') {
        for (id in item) {
            try {
                let found = JSON.parse(item[id])
                // console.log(`item ${typeof found}`, found)
                projectParse(found, state)
            } catch (error) {
                console.log(error)
            }

        }
    }
}

/**
 * 
 * @deprecated not using indexed sets, replaced with filters
 * @param {*} event 
 * @param {*} state 
 */
export const projectTimersHandler = (event, state) => {
    debug && console.log('[react] msg timers get.')
    let item = parse(event)
    debug && console.log('timers/project get ' + typeof item + ' ', item)

    // handle getting a set from gun
    let timerIds = Object.values(item)
    timerIds.map(timerId => {
        Data.getTimer(timerId) // triggers timer Listener
    })
}

