import Heartbeat from './HeartbeatModule';
import { setHeartBeat, store } from './store';

export default HeartbeatTask = async (name, log) => {
  Heartbeat.configService(name && typeof name === 'string' ? name : 'Heartbeat Task')
  if(log == true) console.log('Receiving HeartBeat!')
  let state = store.getState()

  setInterval(() => {
    store.dispatch(setHeartBeat(state.App.heartBeat++))
    let tick = state.App.heartBeat
    Heartbeat.notificationUpdate(tick)
  }, 1000)

  if(log == true) console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
};
