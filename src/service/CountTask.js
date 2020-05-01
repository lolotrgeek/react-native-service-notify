import Heartbeat from './HeartbeatModule';
import { setHeartBeat, store } from './LocalStore';



const CountTask = async (name, log) => {

  Heartbeat.configService(name && typeof name === 'string' ? name : 'Heartbeat Task')

  let title
  let running = false

  function checkRunning(state) {
    if (state.App.timer[1] && state.App.timer[1].status === 'running') {
      console.log('COUNT: running - ', state.App.timer[1])
      title = state.App.project[1] && state.App.project[1].name ? state.App.project[1].name : 'Running...'
      running = true
    } else {
      console.log('COUNT: no running found')
      title = 'Paused'
      running = false
    }
  }

  function updateTick(state) {
    let tick = state.App.heartBeat
    Heartbeat.notificationUpdate(tick, title)
  }

  function stateListener() {
    let state = store.getState()
    console.log('COUNT: state updated')
    checkRunning(state)
  }

  // Named `unsubscribe` because calling the function returned by subscribe will unsubscribe the listener.
store.subscribe(stateListener)

  const counter = setInterval(() => {
    if (!running) {
      clearInterval(counter)
      Heartbeat.notificationPaused(title)
    }
    let state = store.getState()
    store.dispatch(setHeartBeat(state.App.heartBeat + 1))
    let tick = state.App.heartBeat
    Heartbeat.notificationUpdate(tick, title)
    console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
  }, 1000)

};

export default CountTask