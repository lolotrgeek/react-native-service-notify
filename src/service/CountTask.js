import Heartbeat from './HeartbeatModule';
import { setHeartBeat, store } from './LocalStore';



const CountTask = async (name, log) => {

  Heartbeat.configService(name && typeof name === 'string' ? name : 'Heartbeat Task')

  let title
  let running = false

  function checkRunning(state) {
    if (state.App.timer[1] && state.App.timer[1].status === 'running') {
      title = state.App.project[1] && state.App.project[1].name ? state.App.project[1].name : 'Running...'
      running = true
    } else {
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
    if (state.App.timer[1] && state.App.timer[1].status === 'running') {
      title = state.App.project[1] && state.App.project[1].name ? state.App.project[1].name : 'Running...'
      running = true
    } else {
      title = 'Paused'
      running = false
    }
    let tick = state.App.heartBeat
    Heartbeat.notificationUpdate(tick, title)
  }

  // Named `unsubscribe` because calling the function returned by subscribe will unsubscribe the listener.
  const unsubscribe = store.subscribe(stateListener)

  const counter = setInterval(() => {
    if (!running) clearInterval(counter)
    store.dispatch(setHeartBeat(state.App.heartBeat + 1))
  }, 1000)

  if (log == true) console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
};

export default CountTask