import Heartbeat from './HeartbeatModule';
import { NativeEventEmitter } from 'react-native';
import { finishTimer, createTimer, } from '../constants/Data'
import { gun } from '../constants/Store'
import { isTimer, projectValid, isRunning } from '../constants/Validators'
import { setProject, setTimer, store } from './LocalStore'

const deviceEmitter = new NativeEventEmitter(Heartbeat)
const debug = true

/**
 * Task for heartbeat service to sync timers
 */
const DataTask = async (name, log) => {
  debug && console.log('DATA TASK: running')

  gun.get('running').on((runningTimer, runningTimerKey) => {
    debug && console.log('DATA TASK: Running Triggered')
    if (!runningTimer || runningTimer.id === 'none') {
      debug && console.log('DATA TASK: No Running Timer Found')
      let state = store.getState()
      let project = state.App.project
      Heartbeat.notificationPaused(project ? project.name : 'Ready...')
    } else if (typeof runningTimer === 'object' && runningTimer.project) {
      let runningTimerFound = [runningTimer.id, runningTimer]
      let foundProject
      gun.get('projects').get(runningTimer.project).on((projectValue, projectKey) => {
        foundProject = [projectKey, projectValue]
        debug && console.log('DATA TASK: Running Project Found', foundProject)
        if(projectValue && projectValue.name) {
          store.dispatch(setProject(foundProject))

        }
      })
      if (runningTimer.id === 'none' || runningTimer.status === 'done') {
        debug && console.log('DATA TASK: Last Running Timer Found', runningTimer)
        Heartbeat.pauseCounting()
        Heartbeat.notificationPaused(foundProject[1].name)
        store.dispatch(setTimer(runningTimerFound))
      }
      else if (runningTimer.status === 'running') {
        if (isRunning(runningTimerFound)) {
          debug && console.log('DATA TASK: New Running Timer Found', runningTimerFound)
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
      deviceEmitter.removeAllListeners('STATUS')
    }
  })

};
export default DataTask
