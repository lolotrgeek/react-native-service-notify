import { gun } from './Store'
import { elapsedTime, trimSoul, totalTime } from './Functions'
import { isRunning, isTimer } from './Validators'

const debug = false

const parent = gun.get('app')

/**
 * 
 * @param {*} props 
 * @param {function} props.setCount 
 * @param {function} props.start 
 * @param {function} props.stop 
 * @param {function} props.setRunningTimer 
 */
export const getRunningTimer = (props) => {
    gun.get('running').on((runningTimer, runningTimerKey) => {
        if (!runningTimer || runningTimer.id === 'none') {
            debug && console.log('running Timer not Found')
            props.stop()
            props.setRunningTimer(null)
        }
        else {
            let runningTimerFound = [runningTimer.id, trimSoul(runningTimer)]
            if (isRunning(runningTimerFound)) {
                debug && console.log('Running Timer Found: ', runningTimerFound)
                props.setRunningTimer(runningTimerFound)
                props.setCount(elapsedTime(runningTimerFound[1].started))
                props.start()
            }
        }
    }, { change: true })

    return () => gun.get('running').off()
}

/**
 * TimerRunningScreen Specific
 * TODO : consider better function name
 * @param {*} props 
 * @param {function} props.setMood 
 * @param {function} props.setEnergy 
 * @param {function} props.setCount 
 * @param {function} props.start 
 * @param {function} props.stop 
 * @param {function} props.setRunningTimer 
 * @param {function} props.runningProject 
 * @param {function} props.setAlert 
 */
export const getTimerRunning = (props) => {
    gun.get('running').on((runningTimer, runningTimerKey) => {
        if (!runningTimer || runningTimer.id === 'none') {
            debug && console.log('running Timer not Found')
            props.stop()
            props.setRunningTimer(null)
            // if (props.runningProject && props.runningProject.length === 0) props.setAlert(['Error', 'No Timer Exists'])
            // else props.setAlert(['Success', 'Timer Complete!'])
        }
        else {
            let runningTimerFound = [runningTimer.id, trimSoul(runningTimer)]
            debug && console.log('Running Timer: ', runningTimerFound)
            if (isRunning(runningTimerFound)) {
                props.setMood(runningTimerFound[1].mood)
                props.setEnergy(runningTimerFound[1].energy)
                props.setRunningTimer(runningTimerFound)
                props.setCount(elapsedTime(runningTimerFound[1].started))
                props.start()
            }
        }
    }, { change: true })
    return () => gun.get('running').off()
}

/**
 * 
 * @param {*} props 
 * @param {*} props.projectId 
 * @param {*} props.setProject 
 */
export const getProject = (props) => {
    if (props.projectId) {
        gun.get('projects').get(props.projectId).on((projectValue, projectGunKey) => {
            debug && console.log('Got Project ', projectValue)
            props.setProject([props.projectId, trimSoul(projectValue)])
        }, { change: true })
    }
    return () => gun.get('projects').off()
}

/**
 * 
 * @param {*} props
 * @param {function} props.setProjects
 */
export const getProjects = (props) => {
    gun.get('projects').map().on((projectValue, projectKey) => {
        const projectFound = [projectKey, trimSoul(projectValue)]
        debug && console.log('Project Found', projectFound)
        if (projectFound && projectFound[1].status !== 'deleted') {
            props.setProjects(projects => [...projects, projectFound])
        }
    }, { change: true })
    return () => {
        debug && console.log('Returning')
        gun.get('projects').off()
    }
}

/**
 * 
 * @param {*} props 
 */
export const getLastProject = (props) => {
    gun.get('projects').once((projectKeys, projectKey) => {
        let keys = Object.keys(projectKeys)
        const key = keys[keys.length - 1]
        if (key === '_') return false
        debug && console.log('Project Key ', key)
        gun.get('projects', ack => {
            if (ack.err || !ack.put) debug && console.log(ack.err)
            debug && console.log('Root Ack', ack)
        }).get(key, ack => {
            if (ack.err || !ack.put) debug && console.log(ack.err)
            debug && console.log('Get Ack', ack)
        }).on((projectValue, projectKey) => {
            const projectFound = [projectKey, trimSoul(projectValue)]
            debug && console.log('Project Found', projectFound)
            if (projectFound && projectFound[1].status !== 'deleted') {
                props.setProjects(projects => [...projects, projectFound])
            }
        }, { change: true })
    })
    return () => {
        debug && console.log('Returning')
        gun.get('projects').off()
    }
}

/**
 * 
 * @param {*} props 
 * @param {Array} props.runningTimer 
 * @param {Function} props.setRunningProject
 */
export const getRunningProject = (props) => {
    if (props.runningTimer && isTimer(props.runningTimer) && props.runningTimer[1]) {
        gun.get('projects').get(props.runningTimer[1].project).on((projectValue, projectKey) => {
            const projectFound = trimSoul(projectValue)
            debug && console.log('Running Project Found', projectFound)
            if (projectFound && projectFound.status !== 'deleted') {
                props.setRunningProject([projectKey, projectFound])
            }
        }, { change: true })
        return () => gun.get('projects').off()
    }
}

const putRunningTimer = (timer) => {
    debug && console.log('Put Running Timer ', timer)
    gun.get('running').get(timer[0]).put(timer[1])
}

/**
 * 
 * @param {*} props 
 * @param {*} props.setCurrent
 * @param {*} props.current
 * @param {*} props.setTimers
 */
export const getTimers = (props) => {
    let currentTimers = []
    debug && console.log('Getting Timers... ')
    gun.get('timers').map().on((timerGunId, projectId) => {
        debug && console.log('TimerId ', projectId)
        gun.get('timers').get(projectId).map().on((timerValue, timerKey) => {
            if (!timerValue || !timerKey) {
                debug && console.log('No Timer Found ')
                return false
            }
            const foundTimer = [timerKey, trimSoul(typeof timerValue === 'string' ? JSON.parse(timerValue) : timerValue)]

            debug && console.log('Found Timer', foundTimer)
            if (foundTimer[1].status === 'done') {
                // let check = current.some(id => id === foundTimer[0])
                debug && console.log(currentTimers)
                let check = currentTimers.some(id => id === foundTimer[0])
                if (!check) {
                    debug && console.log('Listing Timer', foundTimer)
                    props.setTimers(timers => [...timers, foundTimer])
                    currentTimers.push(foundTimer[0])
                }
                else if (foundTimer[1].edited.length > 0) {
                    debug && console.log('Updating Existing Timer', foundTimer)
                    props.setTimers(timers => timers.map((timer, index) => {
                        if (timer[0] === foundTimer[0]) {
                            debug && console.log('Updating Timer', timer)
                            timer[1] = foundTimer[1]
                        }
                        return timer
                    }))
                }
                else {
                    debug && console.log('No Changes', foundTimer)
                }
                // props.setCurrent(current => [...current, foundTimer[0]])
            }
            else {
                debug && console.log('Updating Removed Timer', foundTimer)
                props.setTimers(timers => timers.filter(timer => timer[0] === foundTimer[0]))
            }
        }, { change: true })
    }, { change: true })
    return () => gun.get('timers').off()
}


export const updateState = (props) => {
    let refresh = setTimeout(props.setOnline(online => online ? online + 1 : 0), 1000)
    return () => clearTimeout(refresh) 
}

/**
 * 
 * @param {*} props 
 * @param {*} props.projectId 
 * @param {*} props.setCurrent
 * @param {*} props.current
 * @param {*} props.setTimers
 */
export const getTimersProject = (props) => {
    let currentTimers = []
    debug && console.log('Getting Timers... ')
    gun.get('timers').get(props.projectId, ack => {
        debug && console.log('GET ACK', ack.put)
    }).map().on((timerValue, timerKey) => {
        if (!timerValue || !timerKey) {
            debug && console.log('No Timer Found ')
            return false
        }
        const foundTimer = [timerKey, trimSoul(typeof timerValue === 'string' ? JSON.parse(timerValue) : timerValue)]
        debug && console.log('Found Timer', foundTimer)
        if (foundTimer[1].status === 'done') {
            // let check = current.some(id => id === foundTimer[0])
            debug && console.log(currentTimers)
            let check = currentTimers.some(id => id === foundTimer[0])
            if (!check) {
                debug && console.log('Listing Timer', foundTimer)
                props.setTimers(timers => [...timers, foundTimer])
                currentTimers.push(foundTimer[0])
            }
            else if (foundTimer[1].edited.length > 0) {
                debug && console.log('Updating Existing Timer', foundTimer)
                props.setTimers(timers => timers.map((timer, index) => {
                    if (timer[0] === foundTimer[0]) {
                        debug && console.log('Updating Timer', timer)
                        timer[1] = foundTimer[1]
                    }
                    return timer
                }))
            }
            else {
                debug && console.log('No Changes', foundTimer)
            }
            // props.setCurrent(current => [...current, foundTimer[0]])
        }
        else {
            debug && console.log('Updating Removed Timer', foundTimer)
            props.setTimers(timers => timers.filter(timer => timer[0] === foundTimer[0]))
        }
    }, { change: true })
    return () => gun.get('timers').off()
}

/**
 * REFERENCE https://stackoverflow.com/questions/57140482/how-to-trigger-on
 * timers > projectId > timerId > timerKey > timervalue
 * @param {*} props 
 */
export const getTimersProjectDestructured = (props) => {
    let currentTimers = []
    debug && console.log('Getting Timers... ')
    // timers > projectId > timerId
    gun.get('timers').get(props.projectId, ack => {
        debug && console.log('GET ACK', ack)
    }).map().on((timerStrange, timerId) => {
        debug && console.log('Getting Nodes for', timerId)
        // debug && console.log('Found Values?', timerStrange)
        if (!timerId) {
            debug && console.log('No Timer Found ')
            return false
        }
        let foundValues = {}
        let foundTimer = [timerId, foundValues]
        // timers > projectId > timerId > timerKey
        gun.get('timers').get(props.projectId).get(timerId).map().on((timerValue, timerGunKey) => {
            if (!timerValue) {
                debug && console.log('No TimerValue Found ')
                return false
            }
            foundValues[timerGunKey] = timerValue
        }, { change: true })
        debug && console.log('Found Timer', foundTimer)
        if (foundTimer[1].status === 'done') {
            // let check = current.some(id => id === foundTimer[0])
            debug && console.log(currentTimers)
            let check = currentTimers.some(id => id === foundTimer[0])
            if (!check) {
                debug && console.log('Listing Timer', foundTimer)
                props.setTimers(timers => [...timers, foundTimer])
                currentTimers.push(foundTimer[0])
            }
            else if (foundTimer[1].edited.length > 0) {
                debug && console.log('Updating Existing Timer', foundTimer)
                props.setTimers(timers => timers.map((timer, index) => {
                    if (timer[0] === foundTimer[0]) {
                        debug && console.log('Updating Timer', timer)
                        timer[1] = foundTimer[1]
                    }
                    return timer
                }))
            }
            else {
                debug && console.log('No Changes', foundTimer)
            }
            // props.setCurrent(current => [...current, foundTimer[0]])
        }
        else {
            debug && console.log('Updating Removed Timer', foundTimer)
            props.setTimers(timers => timers.filter(timer => timer[0] === foundTimer[0]))
        }
    }, { change: true })
    return () => gun.get('timers').off()
}

/**
 * 
 * @param {*} props 
 * @param {*} props.setEdits 
 * @param {*} props.projectId 
 */
export const getProjectHistory = (props) => {
    gun.get('history').get('projects').get(props.projectId).map().on((projectValue, projectGunKey) => {
        debug && console.log('History ', projectGunKey, projectValue)
        props.setEdits(edits => [...edits, [props.projectId, trimSoul(projectValue), projectGunKey]])
    }, { change: true })
    return () => gun.get('history').off()
}

/**
 * 
 * @param {*} props
 * @param {*} props.setProjects
 */
export const getDeletedProjects = (props) => {
    gun.get('projects').map().on((projectValue, projectKey) => {
        if (projectValue.status === 'deleted') {
            debug && console.log(projectValue)
            props.setProjects(projects => [...projects, [projectKey, projectValue]])
        }
    }, { change: true })
    return () => gun.get('projects').off()
}

/**
 * 
 * @param {*} props 
 * @param {*} props.setAlert 
 * @param {*} props.projectId 
 * @param {*} props.timerId 
 * @param {*} props.history 
 * @param {*} props.setStarted 
 * @param {*} props.setEnded 
 * @param {*} props.setMood 
 * @param {*} props.setEnergy 
 * @param {*} props.setTotal 
 * @param {*} props.setTimer 
 * @param {*} props.started 
 * @param {*} props.ended 
 * @param {*} props.projectlink 
 */
export const getTimerForEdit = (props) => {
    debug && console.log('Getting: ', props.projectId, props.timerId)
    gun.get('timers').get(props.projectId, ack => {
        if (ack.err || !ack.put) props.setAlert(['Error', 'No Project Exists'])
    }).get(props.timerId, ack => {
        if (ack.err || !ack.put) props.setAlert(['Error', 'No Timer Exists'])
    }).on((timerValue, timerGunId) => {
        if (!timerValue) {
            props.setAlert(['Error', 'No Timer Exists'])
            props.history.push((props.projectlink(props.projectId)))
        }
        else {
            const foundTimer = [props.timerId, trimSoul(typeof timerValue === 'string' ? JSON.parse(timerValue) : timerValue)]
            props.setStarted(new Date(foundTimer[1].started))
            props.setEnded(new Date(foundTimer[1].ended))
            props.setMood(foundTimer[1].mood)
            props.setEnergy(foundTimer[1].energy)
            props.setTotal(foundTimer[1].total === 0 ? totalTime(props.started, props.ended) : foundTimer[1].total)
            props.setTimer(foundTimer)
        }
    }, { change: true })
    return () => gun.get('timers').off()
}

/**
 * 
 * @param {*} props 
 * @param {*} props.timerId 
 * @param {*} props.projectId 
 * @param {*} props.setAlert 
 * @param {*} props.projectlink 
 * @param {*} props.history 
 * @param {*} props.setTimer 
 */
export const getProjectHistoryTimers = (props) => {
    debug && console.log('Getting: ', props.projectId, props.timerId)
    gun.get('timers').get(props.projectId, ack => {
        if (ack.err || !ack.put) props.setAlert(['Error', 'No Project Exists'])
    }).get(props.timerId, ack => {
        if (ack.err || !ack.put) props.setAlert(['Error', 'No Timer Exists'])
    }).on((timerValue, timerGunId) => {
        if (!timerValue) {
            props.setAlert(['Error', 'No Timer Exists'])
            props.history.push((props.projectlink(props.projectId)))
        }
        let foundTimer = [props.timerId, trimSoul(timerValue)]
        props.setTimer(foundTimer)

    }, { change: true })
    return () => gun.get('timers').off()

}

/**
 * 
 * @param {*} props 
 * @param {*} props.current 
 * @param {*} props.setCurrent 
 * @param {*} props.setTimers 
 * @param {*} props.projectId 
 */
export const getDeletedTimers = (props) => {
    // let currentTimers = []
    gun.get('timers').get(props.projectId).map().on((timerValue, timerKey) => {
        if (timerValue) {
            const foundTimer = [timerKey, trimSoul(timerValue)]
            if (foundTimer[1].status === 'deleted') {
                let check = props.current.some(id => id === foundTimer[0])
                // let check = currentTimers.some(id => id === foundTimer[0])
                if (!check) {
                    debug && console.log('Listing Timer', foundTimer)
                    props.setTimers(timers => [...timers, foundTimer])
                }
                props.setCurrent(current => [...current, foundTimer[0]])
                // currentTimers.push(foundTimer[0])
            }
            // else if (foundTimer[1].status === 'running') {
            //     putRunningTimer(foundTimer)
            // }
        }
    }, { change: true })

    return () => gun.get('timers').off()
}

/**
 * 
 * @param {*} props
 * @param {*} props.projectId
 * @param {*} props.timerId
 * @param {*} props.setEdits
 */
export const getTimerHistory = (props) => {
    gun.get('history').get('timers').get(props.projectId).get(props.timerId).map().on((timerValue, timerGunId) => {
        props.setEdits(timers => [...timers, [props.timerId, trimSoul(timerValue), timerGunId]])
    }, { change: true })
    return () => gun.get('timers').off()
}