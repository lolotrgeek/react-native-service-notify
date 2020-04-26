import Heartbeat from './HeartbeatModule';
import { setHeartBeat, store } from './store';

export default CountTask = async (name, log) => {
  Heartbeat.getStatus(status => {
    console.log(status)
    if (status === 'STARTED') { 
          
    }
  })

  Heartbeat.configService(name && typeof name === 'string' ? name : 'Heartbeat Task')
  if (log == true) console.log('Receiving HeartBeat!')
  let state = store.getState()

  store.dispatch(setHeartBeat(state.App.heartBeat + 1))
  let tick = state.App.heartBeat
  Heartbeat.notificationUpdate(tick)

  if (log == true) console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)
};
