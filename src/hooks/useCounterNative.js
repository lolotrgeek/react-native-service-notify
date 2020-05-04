import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from '../service/HeartbeatModule';
import { store, setHeartBeat } from '../service/LocalStore';

const debug = false
const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {
  const setCount = count => store.dispatch(setHeartBeat(count))
  const [status, setStatus] = useState('')
  const [count, setLocalCount] = useState(store.getState().App.heartBeat)

  useEffect(() => {
    Heartbeat.getStatus(state => setStatus(state))
    deviceEmitter.addListener("STATUS", event => {
      setStatus(event)
      debug && console.log('Status: ', event)
    })
    return () => deviceEmitter.removeAllListeners("STATUS") 
  }, [])

  useEffect(() => {
    function stateListener() {
      let state = store.getState()
      setLocalCount(state.App.heartBeat)
      debug && console.log('State: ', state.App)
    }
  
    const unsubscribe = store.subscribe(stateListener)
    return () => unsubscribe()
  },[])

  const getTitle = () => {
    let state = store.getState()
    let project = state.App.project[1]
    return project && typeof project.name === 'string' ? project.name : 'App Name'
  }

  const startService = () => {
    Heartbeat.startService()
  }
  const start = (title) =>  {
    Heartbeat.notificationUpdate(0, title ? title : getTitle())
    Heartbeat.resumeCounting()
  }
  const stop = (title) =>  {
    Heartbeat.notificationPaused(title ? title : getTitle())
    Heartbeat.pauseCounting()
  }
  const stopService = (title) => {
    Heartbeat.stopService()
    if(title) Heartbeat.notificationPaused(title ? title : getTitle())
  }

  return { status, count, setCount, start, stop, startService, stopService };
}