import React, { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';
import Heartbeat from './Heartbeat';

const deviceEmitter = new NativeEventEmitter

export default function useCounter() {
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

      const start = () => count === 0 ? Heartbeat.startService() : Heartbeat.resume()
      const stop = () => Heartbeat.pause()
      const end = () => Heartbeat.stopService()

      return { count, setCount, start, stop, end };
}