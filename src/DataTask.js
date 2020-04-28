import Heartbeat from './HeartbeatModule';
import { NativeEventEmitter } from 'react-native';
import { gun } from './Data'

const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default DataTask = async (name, log) => {

  // local
  // FIX triggers remote 'on' listener and triggers action
  // inefficient and introduces circular logic
  deviceEmitter.addListener("ACTION", event => {
    console.log('Action: ', event)
    Heartbeat.getCountStatus(state => {
      if (state === 'RUNNING') {
        gun.get('test').get('running').put("RUNNING")

      } else {
        gun.get('test').get('running').put("STOPPED")
      }
    })
  })
  // remote
  gun.get('test').get('running').on((data, key) => {
    if (data && data === 'RUNNING') {
      console.log('Starting from remote...')
      Heartbeat.startActionRemote()
    } else {
      console.log('Stopping from remote...')
      Heartbeat.stopActionRemote()
    }
  })

  // Status
  deviceEmitter.addListener("STATUS", event => {
    if(event === 'STOPPED') {
      console.log('Removing Listeners')
      gun.get('test').off()
      deviceEmitter.removeAllListeners('ACTION')
      deviceEmitter.removeAllListeners('STATUS')
    }
  })

};
