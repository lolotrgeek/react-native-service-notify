import Heartbeat from './Heartbeat';
import { setHeartBeat, store } from './store';

export default HeartbeatTask = async (name, log) => {
  Heartbeat.configService(name && typeof name === 'string' ? name : 'Heartbeat Task')
  if(log == true) console.log('Receiving HeartBeat!')
  let state = store.getState()

  store.dispatch(setHeartBeat(state.App.heartBeat + 1));
  let tick = state.App.heartBeat
  Heartbeat.notificationUpdate(tick.toString())

  if(log == true) console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
};
