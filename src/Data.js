import { cloneTimer, newProject, doneTimer, newTimer } from './Models'
import { isRunning, multiDay, newEntryPerDay } from './Functions'
import store from './Store'

const debug = true

export const createProject = (name, color) => {
    const project = newProject(name, color)
    if (!project) return false
    debug && console.log('Creating Project', project)
    store.set(`history/projects${project[0]}`, JSON.stringify(project[1]))
    store.put(`projects/${project[0]}`, JSON.stringify(project[1]))
}

export const updateProject = (project, updates) => {
    let projectEdit = project
    Object.assign(projectEdit[1], updates)
    if (projectEdit[1].deleted) { projectEdit[1].deleted = null }
    projectEdit[1].edited = new Date().toString()
    debug && console.log('Updating Project', projectEdit)
    store.set(`history/projects/${project[0]}`, projectEdit[1])
    store.put(`projects/${projectEdit[0]}`, projectEdit[1])
}

export const restoreProject = (project) => {
    let restoredProject = project
    if (restoredProject[1].status === 'deleted') {
        restoredProject[1].status = 'active'
    }
    debug && console.log('Restoring Project', restoredProject)
    store.put(`projects/${restoreProject[0]}`, restoreProject[1])
}


export const deleteProject = (project) => {
    debug && console.log('Deleting Project', project)
    let projectDelete = project
    projectDelete[1].deleted = new Date().toString()
    store.set(`history/projects/${projectDelete[0]}`, projectDelete[1])
    projectDelete[1].status = 'deleted'
    store.put(`projects/${project[0]}`, projectDelete[1])
}
/**
 * Generates a new timer using the standard timer model
 * TODO: consider doing a pre-create sync to eliminate unsynced deleted projects
 * @param {*} projectId 
 */
export const createTimer = (projectId) => {
    if (!projectId || typeof projectId !== 'string' || projectId.length < 9) return false
    debug && console.log('Creating Timer', projectId)
    const timer = newTimer(projectId)
    debug && console.log('Created Timer', timer)
    store.put('running', timer[1])
    store.set(`history/timers/${projectId}/${timer[0]}`, timer[1])
    return true
}

export const runTimer = (timer) => {
    store.put('running/timer', JSON.stringify(timer))
}

export const updateTimer = (timer) => {
    let editedTimer = timer
    if (editedTimer[1].deleted) { editedTimer[1].deleted = null }
    editedTimer[1].edited = new Date().toString()
    debug && console.log('Updating Timer', editedTimer)
    store.set(`history/timers/${editedTimer[1].project}/${editedTimer[0]}`, editedTimer[1])
    store.put(`timers/${editedTimer[1].project}/${editedTimer[0]}`, editedTimer[1])
}

export const restoreTimer = (timer) => {
    let restoredTimer = timer
    // restoredTimer[1].restored = new Date().toString()
    if (restoredTimer[1].status === 'deleted') {
        restoredTimer[1].status = 'done'
        store.set(`history/timers/${restoreTimer[1].project}/${restoreTimer[0]}`, restoredTimer[1])
    }
    debug && console.log('Restoring Timer', restoredTimer)
    store.put(`timer/${restoreTimer[1].project}/${restoreTimer[0]}/`, restoredTimer[1])
}

export const endTimer = (timer) => {
    debug && console.log('Ending', timer)
    store.set(`history/timers/${timer[1].project}/${timer[0]}`, timer[1])
    store.put(`timrs/${timer[1].project}/${timer[0]}`, timer[1])
}

export const endTimerDestructured = (timer) => {
    debug && console.log('Ending', timer)
    store.set(`history/timers/${timer[1].project}/${timer[0]}`, timer[1])
    const keys = Object.keys(timer[1])
    debug && console.log('destructure', keys)
    keys.map(key => {
        debug && console.log('Storing', key, timer[1][key])
        // timers > projectId > timerId > timerKey > timervalue
        store.put(`timers/${timer[1].project}/${timer[0]}/${key}`, timer[1].key)
        return key
    })
}

export const deleteTimer = (timer) => {
    debug && console.log('Deleting Timer', timer)
    const timerDelete = timer
    timerDelete[1].deleted = new Date().toString()
    timerDelete[1].status = 'deleted'
    store.put(`timer/${timer[1].project}/${timer[0]}`, timerDelete[1])
}

/**
 * Generates a new timer using the given timer model
 * @param {String} projectId project hashid
 * @param {Object} value a timer object
 */
export const addTimer = (projectId, value) => {
    const timer = cloneTimer(value)
    debug && console.log('Storing Timer', timer)
    store.set(`history/timers/${projectId}/${timer[0]}`, timer[1])
    store.put(`timers/${projectId}/${timer[0]}`, timer[1])
}

export const finishTimer = (timer) => {
    if (isRunning(timer)) {
        debug && console.log('Finishing', timer)
        let done = doneTimer(timer)
        store.put('running', {id: 'none'})
        // Danger zone until endTimer is called
        if (multiDay(done[1].started, done[1].ended)) {
            const dayEntries = newEntryPerDay(done[1].started, done[1].ended)
            dayEntries.map((dayEntry, i) => {
                let splitTimer = done
                splitTimer[1].started = dayEntry.start
                splitTimer[1].ended = dayEntry.end
                debug && console.log('Split', i, splitTimer)
                if (i === 0) { endTimer(splitTimer) } // use initial timer id for first day
                else { addTimer(splitTimer[1].project, splitTimer[1]) }
                return splitTimer
            })
        } else {
            endTimer(done)
        }
    } else { return timer }
}

export const getProjects = () => {
    store.getAll('projects')
}
