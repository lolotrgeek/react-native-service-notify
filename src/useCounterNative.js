import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from './HeartbeatModule';

const deviceEmitter = new NativeEventEmitter

export default function useCounter(countdown) {
  const [count, setCount] = useState(0)
    useEffect(() => {
        if (deviceEmitter) {
          console.log('listening...')
          deviceEmitter.addListener("Heartbeat", event => {
            console.log('device Event: ', event)
            if (event) setCount(event)
          })
        }
        return () => { setCount(0); console.log('stop listening')}
      },[])

      const start = () => Heartbeat.startService()
      const stop = () => Heartbeat.stopService()
      const reset = () => {stop; setCount(0)}

      return { count, setCount, start, stop, reset };
}