import Heartbeat from './HeartbeatModule';
import { gun } from './Data'

export default DataTask = async (name, log) => {
  Heartbeat.getStatus(status => console.log('DATA: ', status))
  gun.get('test').on((data, key) => console.log(data))

};
