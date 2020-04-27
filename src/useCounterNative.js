import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from './HeartbeatModule';

const deviceEmitter = new NativeEventEmitter(Heartbeat)

export default function useCounter(countdown) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    console.log('listening...')
    deviceEmitter.addListener("Heartbeat", event => {
      console.log('Device Event: ', event)
      setCount(event)
    })
    return () => { setCount(0); deviceEmitter.removeAllListeners("Heartbeat"); console.log('stop listening') }
  }, [])

  const startService = () => Heartbeat.startService()
  const start = () => Heartbeat.startAction()
  const stop = () => Heartbeat.stopAction()
  const stopService = () => Heartbeat.stopService()
  const reset = () => { stop; setCount(0) }

  return { count, setCount, start, stop, reset, startService, stopService };
}