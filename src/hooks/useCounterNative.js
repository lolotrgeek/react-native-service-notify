import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from '../service/HeartbeatModule';
import { store, setHeartBeat } from '../service/LocalStore';


const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {
  const setCount = count => store.dispatch(setHeartBeat(count))
  const [status, setStatus] = useState('')
  const [count, setLocalCount] = useState(store.getState().App.heartBeat)

  useEffect(() => {
    Heartbeat.getStatus(state => setStatus(state))
    deviceEmitter.addListener("STATUS", event => {
      setStatus(event)
      console.log('Status: ', event)
    })
    return () => { deviceEmitter.removeAllListeners("STATUS") }
  }, [])

  useEffect(() => {
    function stateListener() {
      let state = store.getState()
      setLocalCount(state.App.heartBeat)
      console.log('State: ', state.App)
    }
  
    const unsubscribe = store.subscribe(stateListener)
    return () => unsubscribe()
  },[])


  const startService = () => Heartbeat.startService()
  const start = (title) =>  {
    Heartbeat.notificationUpdate(0, title)
    Heartbeat.resumeCounting()
  }
  const stop = (title) =>  {
    Heartbeat.notificationPaused(title)
    Heartbeat.pauseCounting()
  }
  const stopService = () => Heartbeat.stopService()

  return { status, count, setCount, start, stop, startService, stopService };
}