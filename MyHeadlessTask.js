import Heartbeat from './Heartbeat';
import { setHeartBeat, store } from './store';

Heartbeat.configService('CHnage')

export default MyHeadlessTask = async () => {
  console.log('Receiving HeartBeat!');
  let state = store.getState()

  store.dispatch(setHeartBeat(state.App.heartBeat + 1));
  let tick = state.App.heartBeat
  Heartbeat.notificationUpdate(tick.toString())

  console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
};
