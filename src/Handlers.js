// Handlers for event listeners
// A Handler consumes an event and some state, applies conditions, then updates state 
import * as Data from './Data'
import { parse } from './Functions'

const debug = false

export const putHandler = (event, state) => {
    if (!event) return
    debug && console.log('[react] successful put.')
    let item = parse(event)
    debug && console.log('put ' + typeof item + ' ', item)
    if (item.type === 'timer') {
        debug && console.log('[react] timer.')
        timerParse(item, state)
    }
}

export const timerParse = (found, state) => {
    // duplicate/edit parsing
    let alreadyInTimers = state.timers.some(timer => timer.id === found.id)
    if (!alreadyInTimers) {
        debug && console.log('Listing Timer', found)
        state.setTimers(timers => [...timers, found])
    }
    else if (alreadyInTimers && found.edited && found.edited.length > 0) {
        debug && console.log('Updating Listed Timer', found)
        state.setTimers(timers => timers.map(timer => {
            if (timer.id === found.id) {
                debug && console.log('Updating Timer', timer)
                timer = found
            }
            return timer
        }))
    }
    else if (alreadyInTimers && found.status === 'deleted') {
        debug && console.log('Updating Removed Timer', found)
        state.setTimers(timers => timers.filter(timer => timer.id === found.id))
    }
    else {
        debug && console.log(' Found Timer with No Changes', found)
    }
    // status parsing
    if (found.status === 'running') {
        state.running.current = found
    }
    else if (found.status === 'done' && found.id === state.running.current.id) {
        debug && console.log('[react] Setting last run Timer.')
        debug && console.log(found)
        state.running.current = found
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
        let id; for (id in item) {
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
        let id; for (id in item) {
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
