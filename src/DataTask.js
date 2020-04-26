import Heartbeat from './HeartbeatModule';
import { setHeartBeat, store } from './store';

export default DataTask = async (name, log) => {
 Heartbeat.getStatus(status => console.log('DATA: ' , status))
};
