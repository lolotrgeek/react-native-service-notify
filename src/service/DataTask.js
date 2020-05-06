import Heartbeat from './HeartbeatModule';
import { NativeEventEmitter } from 'react-native';
import { finishTimer, createTimer, } from '../constants/Data'
import { gun } from '../constants/Store'
import { isTimer, projectValid, isRunning } from '../constants/Validators'
import { setProject, setTimer, setHeartBeat, store } from './LocalStore'

const deviceEmitter = new NativeEventEmitter(Heartbeat)
const debug = true

/**
 * Task for heartbeat service to sync timers
 */
const DataTask = async (name, log) => {
  debug && console.log('DATA TASK: running')
  const alive = setInterval(() => console.log('alive'), 1000)

  gun.get('running').on((runningTimer, runningTimerKey) => {
    debug && console.log('DATA TASK: Timer Check Triggered')
    if (!runningTimer || runningTimer.id === 'none') {
      debug && console.log('DATA TASK: No Running Timer Found')
      let state = store.getState()
      let project = state.App.project
      let title = 'App Name'
      if (project && project.length === 2 && typeof project[1] === 'object') {
        title = project[1].name
      }
      debug && console.log('DATA TASK: Pausing Notification', title)
      Heartbeat.notificationPaused(title)
    } else if (typeof runningTimer === 'object' && runningTimer.project) {
      let runningTimerFound = [runningTimer.id, runningTimer]
      let foundProject
      gun.get('projects').get(runningTimer.project).on((projectValue, projectKey) => {
        foundProject = [projectKey, projectValue]
        debug && console.log('DATA TASK: Running Project Found', foundProject)
        if (projectValue && projectValue.name) {
          store.dispatch(setProject(foundProject))

        }
      })
      if (runningTimer.id === 'none' || runningTimer.status === 'done') {
        debug && console.log('DATA TASK: Last Running Timer Found', runningTimer)
        Heartbeat.pauseCounting()
        debug && console.log('DATA TASK: Pausing Notification', foundProject[1].name)
        Heartbeat.notificationPaused(foundProject[1].name)
        if (foundProject && foundProject.length === 2 && typeof foundProject[1] === 'object') store.dispatch(setProject(foundProject))
      }
      else if (runningTimer.status === 'running') {
        if (isRunning(runningTimerFound)) {
          debug && console.log('DATA TASK: New Running Timer Found', runningTimerFound)
          if (foundProject && foundProject.length === 2 && typeof foundProject[1] === 'object') {
            debug && console.log('DATA TASK: Updating Notification', foundProject[1].name)
            // Heartbeat.resumeCounting()
            // Heartbeat.notificationUpdate(0, foundProject[1].name)
          }
          store.dispatch(setTimer(runningTimerFound))
        }
      }
    }

  }, { change: true })

  // Cleanup
  deviceEmitter.addListener("STATUS", event => {
    if (event === 'STOPPED') {
      debug && console.log('DATA TASK: Removing Listeners')
      gun.get('running').off()
      gun.get('projects').off()
      clearInterval(alive)
      deviceEmitter.removeAllListeners('STATUS')
    }
  })

};
export default DataTask
