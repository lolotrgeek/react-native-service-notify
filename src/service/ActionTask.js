import Heartbeat from './HeartbeatModule';
import { NativeEventEmitter } from 'react-native';
import { finishTimer, createTimer, } from '../constants/Data'
import { gun } from '../constants/Store'
import { setProject, setTimer, store } from './LocalStore'

const deviceEmitter = new NativeEventEmitter(Heartbeat)
const debug = true

/**
 * Task for heartbeat service to sync timers
 */
const ActionTask = async (name, log) => {
  debug && console.log('ACTION TASK: running')

  // Service Notification Button Actions
  deviceEmitter.addListener("ACTION", event => {
    let state = store.getState()
    let project = state.App.project
    let timer = state.App.timer
    let title = project[1] && typeof project[1].name === 'string' ? project[1].name : 'App Name'
    if (event === 'start' && timer.length === 2 && project.length === 2) {
      const timer = createTimer(project[0])
      debug && console.log('ACTION TASK: Starting', timer)
      Heartbeat.resumeCounting()
      debug && console.log('ACTION TASK: Updating Notification', title)
      Heartbeat.notificationUpdate(state.App.heartBeat, title)
      debug && console.log(' ACTION TASK: Storing...', timer)
      store.dispatch(setTimer(timer))
    }
    else if (event === 'stop' && timer.length === 2 && project.length === 2) {
      debug && console.log('ACTION TASK: Stopping')
      Heartbeat.pauseCounting()
      debug && console.log('ACTION TASK: Pausing Notification', title)
      Heartbeat.notificationPaused(title)
      finishTimer(timer)
    }
  })

  // Cleanup
  deviceEmitter.addListener("STATUS", event => {
    if (event === 'STOPPED') {
      debug && console.log('ACTION TASK: Removing Listeners')
      deviceEmitter.removeAllListeners('ACTION')
      deviceEmitter.removeAllListeners('STATUS')
    }
  })

};
export default ActionTask
