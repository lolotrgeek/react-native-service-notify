import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from '../service/HeartbeatModule';
import { store, setHeartBeat } from '../service/LocalStore';
import { gun } from '../constants/Data'


const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {

  let state = store.getState()
  let count = 0
  const setCount = count => store.dispatch(setHeartBeat(count))
  const [status, setStatus] = useState('')

  useEffect(() => {
    Heartbeat.getStatus(state => setStatus(state))
    deviceEmitter.addListener("STATUS", event => {
      console.log('Status: ', event)
    })
    return () => { deviceEmitter.removeAllListeners("STATUS") }
  }, [])

  function stateListener() {
    let state = store.getState()
    count = state.App.heartBeat
  }

  const unsubscribe = store.subscribe(stateListener)

  const startService = () => Heartbeat.startService()
  const start = () =>  {}
  const stop = () =>  {}
  const stopService = () => Heartbeat.stopService()

  return { status, state, count, setCount, start, stop, startService, stopService };
}