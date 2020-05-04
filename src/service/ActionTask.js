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
    let foundTimer = state.App.timer[1]
    let title = project[1] && typeof project[1].name === 'string' ? project.name : 'Heartbeat Task'
    if (event === 'start') {
      const timer = createTimer(project[0])
      debug && console.log('ACTION TASK: Starting', timer)
      Heartbeat.resumeCounting()
      Heartbeat.notificationUpdate(state.App.heartBeat, title)
      debug && console.log(' ACTION TASK: Storing...', timer)
      store.dispatch(setTimer(timer))
    }
    else if (event === 'stop' && state.App.timer && state.App.timer.length === 2) {
      debug && console.log('ACTION TASK: Stopping', state.App.timer)
      finishTimer(state.App.timer)
      Heartbeat.pauseCounting()
      Heartbeat.notificationPaused(title)
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
