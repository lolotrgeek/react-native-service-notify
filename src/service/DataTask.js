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

  // Service Notification Button Actions
  deviceEmitter.addListener("ACTION", event => {
    let state = store.getState()
    let project = state.App.project[1]
    let runningTimer = state.App.timer[1]
    let title = project && typeof project.name === 'string' ? project.name : 'Heartbeat Task'
    if (event === 'start' && runningTimer && typeof runningTimer === 'object' && runningTimer.status === 'done') {
      const timer = createTimer(runningTimer.project)
      debug && console.log('DATA TASK: Starting', timer)
      Heartbeat.resumeCounting()
      Heartbeat.notificationUpdate(state.App.heartBeat, title)
      debug && console.log(' DATA TASK: Storing...')
      store.dispatch(setTimer(timer))
    }
    else if (event === 'stop' && state.App.timer && state.App.timer.length === 2) {
      debug && console.log('DATA TASK: Stopping', state.App.timer)
      finishTimer(state.App.timer)
      Heartbeat.pauseCounting()
      Heartbeat.notificationPaused(title)
    }
  })

  gun.get('running').on((runningTimer, runningTimerKey) => {
    debug && console.log('DATA TASK: Running Timer Found', runningTimer)
    if (runningTimer && isRunning(runningTimer)) {
      gun.get('projects').get(runningTimer.project).on((projectValue, projectKey) => {
        debug && console.log('DATA TASK: Running Project Found', projectValue)
        let foundProject = [projectKey, projectValue]
        // setTitle(foundProject)
        store.dispatch(setProject(foundProject))
      })
      debug && console.log(' DATA TASK: Storing...')
      store.dispatch(setTimer([runningTimer.id, runningTimer]))
    }
  })

  // Cleanup
  deviceEmitter.addListener("STATUS", event => {
    if (event === 'STOPPED') {
      debug && console.log('DATA TASK: Removing Listeners')
      gun.get('running').off()
      gun.get('projects').off()
      deviceEmitter.removeAllListeners('ACTION')
      deviceEmitter.removeAllListeners('STATUS')
    }
  })

};
export default DataTask
