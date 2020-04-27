import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from './HeartbeatModule';
import { store } from './store';

const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Waiting...')

  useEffect(() => {
    let state = store.getState()
    if (state.App.heartBeat > 0) {
      setCount(state.App.heartBeat)
    }
    console.log('listening...')
    deviceEmitter.addListener("Heartbeat", event => {
      console.log('Device Event: ', event)
      setCount(event)
    })
    return () => { setCount(0); deviceEmitter.removeAllListeners("Heartbeat"); console.log('stop listening') }
  }, [])

  useEffect(() => {
    Heartbeat.getStatus(state => setStatus(state))
    deviceEmitter.addListener("STATUS", event => {
      console.log('Service Status: ', event)
      setStatus(event)
    })
    return () => { setStatus(''); deviceEmitter.removeAllListeners("STATUS") }
  }, [])

  const startService = () => Heartbeat.startService()
  const start = () => Heartbeat.startAction()
  const stop = () => Heartbeat.stopAction()
  const stopService = () => Heartbeat.stopService()
  const reset = () => { stop; setCount(0) }

  return { status, count, setCount, start, stop, reset, startService, stopService };
}